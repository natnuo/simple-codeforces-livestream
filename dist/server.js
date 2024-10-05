"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = require("express-handlebars");
const settings_1 = require("./settings");
const node_path_1 = __importDefault(require("node:path"));
const js_sha512_1 = require("js-sha512");
const secrets_1 = require("./secrets");
const PORT = 3000;
const app = (0, express_1.default)();
const hbs = (0, express_handlebars_1.create)({
    // Specify helpers which are only registered on this instance.
    helpers: {
        ifEquals(a, b, options) { return a === b ? options.fn(this) : options.inverse(this); }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', node_path_1.default.resolve('./views'));
const auth_req = (base_req) => {
    const rand = Math.floor(Math.random() * 900000) + 100000;
    base_req += `&time=${Math.floor(Date.now() / 1000)}`;
    return `https://codeforces.com/api${base_req}&apiSig=${rand}${(0, js_sha512_1.sha512)(`${rand}${base_req}#${secrets_1.SECRETS.CF_API_SECRET}`)}`;
};
const get = (endpoint) => __awaiter(void 0, void 0, void 0, function* () {
    // console.debug(endpoint);
    const response = yield (yield fetch(endpoint, { method: "GET" })).json();
    // console.debug(response);
    return response;
});
app.get(settings_1._ST.STATUS_PATH, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const base_req = `/contest.status?apiKey=${secrets_1.SECRETS.CF_API_KEY}&asManager=true&contestId=${settings_1._ST.CID}&count=${settings_1._ST.MXSTD}&from=1`;
    const response = yield get(auth_req(base_req));
    const submissions = response.result.map((subjson) => {
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
            problem_color: settings_1._ST.PCS[subjson.problem.index],
            verdict,
            author: subjson.author.members[0].handle,
        };
    });
    res.render("status", {
        submissions,
        reload_interval: settings_1._ST.SNRIMS,
    });
}));
app.get(settings_1._ST.STANDINGS_PATH, (req, res) => {
    const base_req = `/contest.standings?apiKey=${secrets_1.SECRETS.CF_API_KEY}&asManager=true&contestID=${settings_1._ST.CID}&count=${settings_1._ST.MXSTD}&from=1&showUnofficial=false`;
    res.render("standings");
});
app.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});
