import express from "express";
import { create, engine } from 'express-handlebars';
import { _ST } from "./settings";
import path from "node:path";
import { sha512 } from 'js-sha512';
import { SECRETS } from "./secrets";

const PORT = 3000;

const app = express();

const hbs = create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    ifEquals(a: any, b: any, options: any) { return a === b ? options.fn(this) : options.inverse(this); }
  }
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
  const base_req = `/contest.status?apiKey=${SECRETS.CF_API_KEY}&asManager=true&contestId=${_ST.CID}&count=${_ST.MXSTD}&from=1`;

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
      default:
        console.error(`UNKNOWN VERDICT: ${subjson.verdict}`);
        verdict = "F";
        break;
    }

    return {
      problem_code: subjson.problem.index,
      problem_color: _ST.PCS[subjson.problem.index],
      verdict,
      author: subjson.author.members[0].handle,
    };
  });

  res.render("status", {
    submissions,
    reload_interval: _ST.SNRIMS,
  });
});

app.get(_ST.STANDINGS_PATH, (req, res) => {
  const base_req = `/contest.standings?apiKey=${SECRETS.CF_API_KEY}&asManager=true&contestID=${_ST.CID}&count=${_ST.MXSTD}&from=1&showUnofficial=false`;

  res.render("standings");
});

app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
