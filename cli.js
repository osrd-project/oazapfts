#!/usr/bin/env node
import l from "fs";
import u from "minimist";
import { optsArgumentStyles as t, generateSource as a } from "./index.js";
const n = u(process.argv.slice(2), {
  alias: {
    i: "include",
    e: "exclude"
  },
  boolean: ["optimistic", "useEnumType", "mergeReadWriteOnly"],
  string: ["argumentStyle"]
});
async function m(r, i, c) {
  const o = await a(r, c);
  i ? l.writeFileSync(i, o) : console.log(o);
}
const {
  include: g,
  exclude: p,
  optimistic: d,
  useEnumType: y,
  mergeReadWriteOnly: f,
  argumentStyle: e
} = n, [s, S] = n._;
s || (console.error(`
    Usage:
    oazapfts <spec> [filename]

    Options:
    --exclude, -e <tag to exclude>
    --include, -i <tag to include>
    --optimistic
    --useEnumType
    --mergeReadWriteOnly
    --argumentStyle=<${t.join(" | ")}> (default: positional)
`), process.exit(1));
e !== void 0 && !t.includes(e) && (console.error(
  `--argumentStyle should be one of <${t.join(
    " | "
  )}>, but got "${e}"`
), process.exit(1));
m(s, S, {
  include: g,
  exclude: p,
  optimistic: d,
  useEnumType: y,
  mergeReadWriteOnly: f,
  argumentStyle: e
});
//# sourceMappingURL=cli.js.map
