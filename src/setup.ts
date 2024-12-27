import { confirm, input, rawlist } from "@inquirer/prompts";
import { _CLSCH, header } from "./log";
import { SETTINGS } from "./settings";
import { writeFile } from "node:fs/promises";
import chalk from "chalk";


const save = async () => {
  await writeFile("src/settings.ts", `export let SETTINGS = ${JSON.stringify(SETTINGS, null, 2)}`);
};

const process_color = (hex: string) => {
  if (hex[0] === '#') hex = hex.substring(1);
  if (hex.length < 6 && hex.length > 2) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length > 6) hex = hex.substring(0, 6);
  return "#" + hex.toLowerCase();
};

const edit = async (parent_page: string, option: string) => {
  switch (option) {
    case "CID":
      SETTINGS.CONTEST_ID = parseInt(await input({ message: `Edit the contest ID (current: ${SETTINGS.CONTEST_ID}):`, default: SETTINGS.CONTEST_ID.toString() }));
      break;
    case "PCS":
      SETTINGS.PROBLEM_COLORS = JSON.parse(await input({ message: `Edit the problems and corresponding colors (current: ${JSON.stringify(SETTINGS.PROBLEM_COLORS)}):`, default: JSON.stringify(SETTINGS.PROBLEM_COLORS) }));
      
      for (let [key, value] of Object.entries(SETTINGS.PROBLEM_COLORS)) {
        SETTINGS.PROBLEM_COLORS[key as keyof typeof SETTINGS.PROBLEM_COLORS] = process_color(value);
      }

      break;
    case "ACC":
      SETTINGS.ACCEPTED_COLOR = process_color(await input({ message: `Edit the acceptance color (current: ${SETTINGS.ACCEPTED_COLOR}):`, default: SETTINGS.ACCEPTED_COLOR }));
      break;
    case "TTC":
      SETTINGS.TESTING_COLOR = process_color(await input({ message: `Edit the testing color (current: ${SETTINGS.TESTING_COLOR}):`, default: SETTINGS.TESTING_COLOR }));
      break;
    case "RJC":
      SETTINGS.REJECTED_COLOR = process_color(await input({ message: `Edit the rejection color (current: ${SETTINGS.REJECTED_COLOR}):`, default: SETTINGS.REJECTED_COLOR }));
      break;
    case "FZC":
      SETTINGS.FROZEN_COLOR = process_color(await input({ message: `Edit the frozen color (current: ${SETTINGS.FROZEN_COLOR}):`, default: SETTINGS.FROZEN_COLOR }));
      break;
    case "FZ":
      SETTINGS.FREEZEAT_SECONDS = parseInt(await input({ message: `Freeze at how many seconds (-1 = never freeze, current: ${SETTINGS.FREEZEAT_SECONDS})?`, default: SETTINGS.FREEZEAT_SECONDS.toString() }));
      break;
    case "MXSMD":
      SETTINGS.MAX_SUBMISSIONS_DISPLAYED = parseInt(await input({ message: `Edit maximum submissions displayed in the queue page (current: ${SETTINGS.MAX_SUBMISSIONS_DISPLAYED}):`, default: SETTINGS.MAX_STANDINGS_DISPLAYED.toString() }));
      break;
    case "MXSTD":
      SETTINGS.MAX_STANDINGS_DISPLAYED = parseInt(await input({ message: `Edit maximum standings displayed in the standings page (current: ${SETTINGS.MAX_STANDINGS_DISPLAYED}):`, default: SETTINGS.MAX_STANDINGS_DISPLAYED.toString() }));
      break;
    case "STRIMS":
      SETTINGS.QUEUE_RELOAD_INTERVAL_MS = parseInt(await input({ message: `Edit the queue page refresh interval (milliseconds) (current: ${SETTINGS.QUEUE_RELOAD_INTERVAL_MS}ms):`, default: SETTINGS.QUEUE_RELOAD_INTERVAL_MS.toString() }));
      break;
    case "SNRIMS":
      SETTINGS.STANDINGS_RELOAD_INTERVAL_MS = parseInt(await input({ message: `Edit the queue page refresh interval (milliseconds) (current: ${SETTINGS.STANDINGS_RELOAD_INTERVAL_MS}ms):`, default: SETTINGS.STANDINGS_RELOAD_INTERVAL_MS.toString() }));
      break;
    case "STATUS_PATH":
      SETTINGS.QUEUE_PATH = await input({ message: `Edit the queue page subpath (current: ${SETTINGS.QUEUE_PATH}):`, default: SETTINGS.QUEUE_PATH });
      break;
    case "STANDINGS_PATH":
      SETTINGS.STANDINGS_PATH = await input({ message: `Edit the standings page subpath (current: ${SETTINGS.STANDINGS_PATH}):`, default: SETTINGS.STANDINGS_PATH });
      break;
    case "PORT":
      SETTINGS.PORT = parseInt(await input({ message: `Edit the program's port (current: ${SETTINGS.PORT}):`, default: SETTINGS.PORT.toString() }));
      break;
  }

  options(parent_page);
};

const options = async (page: string) => {
  let action = page;

  switch (page) {
    case "PG_HOME":
      action = await rawlist({
        message: "What would you like to do? Remember, all setting changes require a restart (" + chalk.hex(_CLSCH.secondary)("save + exit + npm run start") + ") to take effect.",
        choices: [
          { name: "Save Settings", value: "SAVE" },
          { name: "Exit", value: "EXIT" },
          { name: "Edit Main Features", value: "PG_MFS" },
          { name: "Edit Unessential Cosmetic Features", value: "PG_UCF" },
          { name: "Edit Functional Features", value: "PG_FF" },
        ],
      });
      break;
    case "PG_MFS":
      action = await rawlist({
        message: "What would you like to do?",
        choices: [
          { name: "Save Settings", value: "SAVE" },
          { name: "Back", value: "PG_HOME" },
          { name: "Edit Contest ID", value: "CID" },
          { name: "Edit Problem List", value: "PCS" },
        ],
      });
      break;
    case "PG_UCF":
      action = await rawlist({
        message: "What would you like to do?",
        choices: [
          { name: "Save Settings", value: "SAVE" },
          { name: "Back", value: "PG_HOME" },
          { name: "Edit Acceptance Color", value: "ACC" },
          { name: "Edit Testing Color", value: "TTC" },
          { name: "Edit Rejection Color", value: "RJC" },
          { name: "Edit Frozen Color", value: "FZC" },
          { name: "Edit Freeze Time", value: "FZ" },
          { name: "Edit [Queue] Submissions Displayed", value: "MXSMD" },
          { name: "Edit [Standings] Standings Displayed", value: "MXSTD" },
        ],
      });
      break;
    case "PG_FF":
      action = await rawlist({
        message: "What would you like to do?",
        choices: [
          { name: "Save Settings", value: "SAVE" },
          { name: "Back", value: "PG_HOME" },
          { name: "Edit Port", value: "PORT" },
          { name: "Edit [Queue] Path", value: "STATUS_PATH" },
          { name: "Edit [Queue] Update Interval", value: "STRIMS" },
          { name: "Edit [Standings] Path", value: "STANDINGS_PATH" },
          { name: "Edit [Standings] Update Interval", value: "SNRIMS" },
        ],
      });
      break;
  }

  if (action === "SAVE") { await save(); options(page); }
  else if (action.substring(0, 3) === "PG_") options(action);
  else if (action !== "EXIT") edit(page, action);
};

const main = async () => {
  console.log(`
${header}
  `);
  
  options("PG_HOME");
};

main();
