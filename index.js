import { A as c, p } from "./tscodegen-mzC1xESn.js";
import { t as x } from "./tscodegen-mzC1xESn.js";
import u from "@apidevtools/swagger-parser";
import f from "swagger2openapi";
const S = ["positional", "object"];
function l(e, t, n) {
  return new c(e, t, n).generateApi();
}
function m(e) {
  return p(e);
}
async function j(e, t = {}) {
  var { doc: n, isConverted: r } = await d(e);
  const o = l(n, t, r), { title: i, version: s } = n.info, a = ["$&", i, s].filter(Boolean).join(`
 * `);
  return m(o).replace(/^\/\*\*/, a);
}
function v(e) {
  return "openapi" in e && e.openapi.startsWith("3");
}
async function d(e) {
  const t = await u.bundle(e);
  return v(t) ? {
    doc: t,
    isConverted: !1
  } : {
    doc: (await f.convertObj(t, {})).openapi,
    isConverted: !0
  };
}
export {
  x as cg,
  l as generateAst,
  j as generateSource,
  S as optsArgumentStyles,
  d as parseSpec,
  m as printAst
};
//# sourceMappingURL=index.js.map
