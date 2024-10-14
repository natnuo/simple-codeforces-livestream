import express from "express";
import { create, engine } from 'express-handlebars';
import { _ST } from "./sttransfer";
import path from "node:path";
import { sha512 } from 'js-sha512';
import { SECRETS } from "./secrets";
import chalk from "chalk";
import { _CLSCH, error, header, log } from "./log";

const app = express();

const hbs = create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    ifEquals(a: any, b: any, options: any) { return a === b ? options.fn(this) : options.inverse(this); },
    add(a: any, b: any) { return a+b; },
  },
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.resolve('./views'));

const auth_req = (base_req: string) => {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  base_req += `&time=${Math.floor(Date.now() / 1000)}`;
  return `https://codeforces.com/api${base_req}&apiSig=${rand}${sha512(`${rand}${base_req}#${SECRETS.CF_API_SECRET}`)}`;
};

const get = async (endpoint: string) => {
  // console.debug(endpoint);

  const response = await (await fetch(endpoint, { method: "GET" })).json();

  // console.debug(response);

  return response;
};

app.get(_ST.STATUS_PATH, async (req, res) => {
  try {
    const base_req = `/contest.status?apiKey=${SECRETS.CF_API_KEY}&contestId=${_ST.CID}&count=${_ST.MXSMD}&from=1`;
  
    const response = await get(auth_req(base_req));
  
    const submissions = response.result.map((subjson: any) => {
      let verdict;
      switch (subjson.verdict) {
        case "OK":
          verdict = "AC";
          break;
        case "WRONG_ANSWER":
          verdict = "WA";
          break;
        case "TIME_LIMIT_EXCEEDED":
          verdict = "TLE";
          break;
        case "COMPILATION_ERROR":
          verdict = "CTE";
          break;
        case "RUNTIME_ERROR":
          verdict = "RTE";
          break;
        case "TESTING":
          verdict = "...";
          break;
        case "IDLENESS_LIMIT_EXCEEDED":
          verdict = "ILE";
          break;
        case "MEMORY_LIMIT_EXCEEDED":
          verdict = "MLE";
          break;
        case undefined:
          verdict = "F";
          break;
        default:
          error(`UNKNOWN VERDICT: ${subjson.verdict}`);
          verdict = "F";
          break;
      }
  
      return {
        problem_code: subjson.problem.index,
        problem_color: _ST.PCS[subjson.problem.index],
        verdict,
        author: subjson.author.teamName ?? subjson.author.members[0].handle,
      };
    });
  
    res.render("status", {
      submissions,
      reload_interval: _ST.SNRIMS,
      ac_color: _ST.ACC,
      rj_color: _ST.RJC,
      tt_color: _ST.TTC,
    });
  } catch (e) {
    error(e);
    res.redirect(_ST.STATUS_PATH);
  }
});

app.get(_ST.STANDINGS_PATH, async (req, res) => {
  try {
    const base_req = `/contest.standings?apiKey=${SECRETS.CF_API_KEY}&contestId=${_ST.CID}&count=${_ST.MXSTD}&from=1&showUnofficial=false`;
  
    const response = await get(auth_req(base_req));
  
    const users = response.result.rows.map((usrjson: any) => {
      return {
        handle: usrjson.party.teamName ?? usrjson.party.members[0].handle,
        points: usrjson.penalty ? usrjson.penalty : usrjson.points,
        problem_results: usrjson.problemResults.map((prjson: any) => {
          return {
            time: prjson.bestSubmissionTimeSeconds !== undefined ? new Date(prjson.bestSubmissionTimeSeconds * 1000).toISOString().substring(11, 19) : "-1",
            fails: prjson.rejectedAttemptCount,
          };
        }),
      };
    });
  
    res.render("standings", {
      users,
      problems: Object.keys(_ST.PCS).map((key) => {
        return {
          code: key,
          color: _ST.PCS[key],
        };
      }),
      problem_count: Object.keys(_ST.PCS).length,
      reload_interval: _ST.STRIMS,
      ac_color: _ST.ACC,
      rj_color: _ST.RJC,
      helpers: {
        // not just passed as option bc i felt like it
        getColWidth(problem_count: number) {
          log(problem_count);
          return `${50/problem_count}%`;
        },
      },
    });
  } catch (e) {
    error(e);
    res.redirect(_ST.STANDINGS_PATH);
  }
});



app.listen(_ST.PORT, () => {
  log(`
${header}


${chalk.bold("Server listening at:")}
:. http://localhost:${_ST.PORT}${_ST.STATUS_PATH}
:. http://localhost:${_ST.PORT}${_ST.STANDINGS_PATH}

Execute ${chalk.hex(_CLSCH.secondary).bold("npm run setup")} to edit SICOLI settings.
  `);
});
