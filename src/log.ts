import chalk from "chalk";

const COLOR_SCHEME = {
  primary: "#1AC8ED",
  background: "#000",
  secondary: "#F02D3A",
  deemp: "#DD0426",
  standard: "#EEE5E9",
}; export const _CLSCH = COLOR_SCHEME;

export const log = (s: any) => { console.log(chalk.hex(_CLSCH.standard).bgHex(_CLSCH.background)(s)); };
export const error = (s: any) => { console.error(chalk.hex(_CLSCH.standard).bgHex(_CLSCH.secondary).bold(s)); };

export const priemp1 = chalk.hex(_CLSCH.primary).bold.underline;

export const hr = (s: any, cols: number) => { return s.repeat(cols / s.length); };
export const vr = (s: any, rows: number) => { return (s + "\n").repeat(rows / s.split(/\r\n|\r|\n/).length); };

export const header = `${hr("-", process.stdout.columns)}
${vr("", process.stdout.rows)}

┌─┐┬┌─┐┌─┐┬  ┬
└─┐││  │ ││  │
└─┘┴└─┘└─┘┴─┘┴

${priemp1("Si")}mple ${priemp1("Co")}deforces ${priemp1("Li")}vestream
${chalk.dim("By Nathan Tao (https://github.com/natnuo)")}

${vr("", 5)}`
