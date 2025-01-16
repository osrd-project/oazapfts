import u from "typescript";
import b from "lodash";
const U = u.factory;
function je(t) {
  const e = t.split(/{([\s\S]+?)}/g), n = b.chunk(e.slice(1), 2);
  return te(
    e[0],
    n.map(([i, r]) => ({
      expression: U.createIdentifier(i),
      literal: r
    }))
  );
}
function Le(t, e) {
  const n = [
    F(
      V(
        Object.entries(e || {}).map(([i, r]) => ({
          name: i,
          initializer: Y(r.default)
        }))
      ),
      {
        type: U.createTypeLiteralNode(
          Object.entries(e || {}).map(([i, r]) => x({
            name: i,
            type: r.enum ? Z(r.enum) : U.createUnionTypeNode([
              l.string,
              l.number,
              l.boolean
            ])
          }))
        )
      }
    )
  ];
  return he(n, je(t));
}
function Ke(t) {
  return t.variables ? Le(t.url, t.variables) : U.createStringLiteral(t.url);
}
function ke(t) {
  if (!t)
    return "/";
  const { url: e, variables: n } = t;
  return n ? e.replace(
    /\{(.+?)\}/g,
    (i, r) => n[r] ? String(n[r].default) : i
  ) : e;
}
function Pe(t) {
  return U.createStringLiteral(ke(t[0]));
}
function Re(t, e) {
  return t.description ? b.camelCase(t.description.replace(/\W+/, " ")) : `server${e + 1}`;
}
function $e(t) {
  return ee(
    t.map((e, n) => [
      Re(e, n),
      Ke(e)
    ])
  );
}
const o = u.factory, Ie = [
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "PATCH",
  "TRACE"
], le = {
  "*/*": "json",
  "application/json": "json",
  "application/x-www-form-urlencoded": "form",
  "multipart/form-data": "multipart"
};
function Ue(t) {
  return typeof t == "string" && /^[^/]+\/[^/]+$/.test(t);
}
function G(t) {
  return le[t] === "json" || /\bjson\b/i.test(t);
}
function Ce(t) {
  if (t?.content)
    for (const e of Object.keys(t.content)) {
      const n = le[e];
      if (n)
        return n;
      if (G(e))
        return "json";
    }
}
function qe({
  style: t = "form",
  explode: e = !0,
  content: n
}) {
  if (n) {
    const i = Object.keys(n);
    if (i.length !== 1)
      throw new Error(
        "Parameters with content property must specify one media type"
      );
    if (!G(i[0]))
      throw new Error(
        "Parameters with content property must specify a JSON compatible media type"
      );
    return "json";
  }
  return e && t === "deepObject" ? "deep" : e ? "explode" : t === "spaceDelimited" ? "space" : t === "pipeDelimited" ? "pipe" : "form";
}
function De(t) {
  if (t && !t.match(/[^\w\s]/) && (t = b.camelCase(t), H(t)))
    return t;
}
function ze(t, e, n) {
  const i = De(n);
  return i || (e = e.replace(/\{(.+?)\}/, "by $1").replace(/\{(.+?)\}/, "and $1"), w(`${t} ${e}`));
}
function Be(t) {
  return typeof t == "boolean" ? t : t && "nullable" in t ? !O(t) && t.nullable : !1;
}
function O(t) {
  return typeof t == "object" && t !== null && "$ref" in t;
}
function de(t) {
  if (!t.startsWith("#/"))
    throw new Error(
      `External refs are not supported (${t}). Make sure to call SwaggerParser.bundle() first.`
    );
  return t.slice(2).split("/").map((e) => decodeURI(e.replace(/~1/g, "/").replace(/~0/g, "~")));
}
function R(t) {
  return t.replace(/.+\//, "");
}
function Me(t) {
  const e = R(t);
  return /^\d+/.test(e) ? de(t).join("_") : e;
}
function ue(t) {
  if (O(t))
    return R(t.$ref);
}
const Ve = {
  readOnly: "Read",
  writeOnly: "Write"
};
function _e(t) {
  return t ? Ve[t] : "";
}
function w(t, e = !1, n) {
  let i = b.camelCase(t) + _e(n);
  return e && (i = b.upperFirst(i)), H(i) ? i : "$" + i;
}
function He(t, e) {
  const n = [], i = t.replace(
    /(.*?)\{(.+?)\}(.*?)(?=\{|$)/g,
    (r, s, c, f) => {
      const p = w(c);
      return n.push({
        expression: C(
          o.createIdentifier("encodeURIComponent"),
          { args: [o.createIdentifier(p)] }
        ),
        literal: f
      }), s;
    }
  );
  return e && n.push({ expression: e, literal: "" }), te(i, n);
}
function pe(t, e) {
  return C(
    o.createPropertyAccessExpression(
      o.createIdentifier("QS"),
      t
    ),
    { args: e }
  );
}
function z(t, e, n) {
  return C(
    o.createPropertyAccessExpression(
      o.createIdentifier("oazapfts"),
      t
    ),
    { args: e, typeArgs: n }
  );
}
function We(t) {
  const e = [], n = {};
  return t.forEach((i) => {
    const r = /^(.+?)\[(.*?)\]/.exec(i.name);
    if (!r) {
      e.push(i);
      return;
    }
    const [, s, c] = r;
    let f = n[s];
    f || (f = n[s] = {
      name: s,
      in: i.in,
      style: "deepObject",
      schema: {
        type: "object",
        properties: {}
      }
    }, e.push(f)), f.schema.properties[c] = i.schema;
  }), e;
}
function fe(t) {
  return t in l;
}
class st {
  constructor(e, n = {}, i = !1) {
    this.spec = e, this.opts = n, this.isConverted = i, this.spec.components?.schemas && this.preprocessComponents(this.spec.components.schemas);
  }
  // see `preprocessComponents` for the definition of a discriminating schema
  discriminatingSchemas = /* @__PURE__ */ new Set();
  aliases = [];
  enumAliases = [];
  enumRefs = {};
  // Collect the types of all referenced schemas so we can export them later
  // Referenced schemas can be pointing at the following versions:
  // - "base": The regular type/interface e.g. ExampleSchema
  // - "readOnly": The readOnly version e.g. ExampleSchemaRead
  // - "writeOnly": The writeOnly version e.g. ExampleSchemaWrite
  refs = {};
  // Maps a referenced schema to its readOnly/writeOnly status
  // This field should be used exclusively within the `checkSchemaOnlyMode` method
  refsOnlyMode = /* @__PURE__ */ new Map();
  // Keep track of already used type aliases
  typeAliases = {};
  reset() {
    this.aliases = [], this.enumAliases = [], this.refs = {}, this.typeAliases = {};
  }
  resolve(e) {
    if (!O(e))
      return e;
    const n = e.$ref, i = de(n), r = b.get(this.spec, i);
    if (typeof r > "u")
      throw new Error(`Can't find ${i}`);
    return r;
  }
  resolveArray(e) {
    return e ? e.map((n) => this.resolve(n)) : [];
  }
  skip(e) {
    return e && e.some((i) => this.opts?.exclude?.includes(i)) ? !0 : this.opts?.include ? !(e && e.some((r) => this.opts.include?.includes(r))) : !1;
  }
  findAvailableRef(e) {
    const n = (r) => {
      try {
        return this.resolve({ $ref: r }), !1;
      } catch {
        return !0;
      }
    };
    if (n(e))
      return e;
    let i = 2;
    for (; ; ) {
      const r = e + String(i);
      if (n(r))
        return r;
      i += 1;
    }
  }
  getUniqueAlias(e) {
    let n = this.typeAliases[e] || 0;
    return n && (this.typeAliases[e] = ++n, e += n), this.typeAliases[e] = 1, e;
  }
  getEnumUniqueAlias(e, n) {
    return this.enumRefs[e] && this.enumRefs[e].values == n ? e : this.getUniqueAlias(e);
  }
  /**
   * Create a type alias for the schema referenced by the given ReferenceObject
   */
  getRefAlias(e, n, i) {
    const r = i ? this.findAvailableRef(e.$ref + "Base") : e.$ref;
    if (!this.refs[r]) {
      let s = this.resolve(e);
      typeof s != "boolean" && i && (s = b.cloneDeep(s), delete s.discriminator);
      const c = typeof s != "boolean" && s.title || Me(r), f = w(c, !0);
      if (this.isTrueEnum(s, c))
        return this.getTypeFromSchema(s, c);
      const p = this.getUniqueAlias(f);
      this.refs[r] = {
        base: o.createTypeReferenceNode(p, void 0),
        readOnly: void 0,
        writeOnly: void 0
      };
      const d = this.getTypeFromSchema(s, void 0);
      this.aliases.push(
        B({
          modifiers: [P.export],
          name: p,
          type: d
        })
      );
      const { readOnly: h, writeOnly: g } = this.checkSchemaOnlyMode(s);
      if (h) {
        const T = this.getUniqueAlias(
          w(c, !0, "readOnly")
        );
        this.refs[r].readOnly = o.createTypeReferenceNode(
          T,
          void 0
        );
        const N = this.getTypeFromSchema(s, c, "readOnly");
        this.aliases.push(
          B({
            modifiers: [P.export],
            name: T,
            type: N
          })
        );
      }
      if (g) {
        const T = this.getUniqueAlias(
          w(c, !0, "writeOnly")
        );
        this.refs[r].writeOnly = o.createTypeReferenceNode(
          T,
          void 0
        );
        const N = this.getTypeFromSchema(s, c, "writeOnly");
        this.aliases.push(
          B({
            modifiers: [P.export],
            name: T,
            type: N
          })
        );
      }
    }
    return this.refs[r][n || "base"] ?? this.refs[r].base;
  }
  getUnionType(e, n, i) {
    if (n) {
      if (n.propertyName === void 0)
        throw new Error("Discriminators require a propertyName");
      const r = new Set(
        Object.values(n.mapping || {}).map(R)
      );
      return o.createUnionTypeNode(
        [
          ...Object.entries(n.mapping || {}).map(
            ([s, c]) => [
              s,
              { $ref: c }
            ]
          ),
          ...e.filter((s) => {
            if (!O(s))
              throw new Error(
                "Discriminators require references, not inline schemas"
              );
            return !r.has(R(s.$ref));
          }).map((s) => {
            const c = R(
              s.$ref
            ), p = this.resolve(s).properties?.[n.propertyName];
            return [(p && "enum" in p ? p?.enum?.[0] : "") || c, s];
          })
        ].map(
          ([s, c]) => (
            // Yields: { [discriminator.propertyName]: discriminatorValue } & variant
            o.createIntersectionTypeNode([
              o.createTypeLiteralNode([
                x({
                  name: n.propertyName,
                  type: o.createLiteralTypeNode(
                    o.createStringLiteral(s)
                  )
                })
              ]),
              this.getTypeFromSchema(c, void 0, i)
            ])
          )
        )
      );
    } else
      return o.createUnionTypeNode(
        e.map(
          (r) => this.getTypeFromSchema(r, void 0, i)
        )
      );
  }
  /**
   * Creates a type node from a given schema.
   * Delegates to getBaseTypeFromSchema internally and
   * optionally adds a union with null.
   */
  getTypeFromSchema(e, n, i) {
    const r = this.getBaseTypeFromSchema(e, n, i);
    return Be(e) ? o.createUnionTypeNode([r, l.null]) : r;
  }
  /**
   * This is the very core of the OpenAPI to TS conversion - it takes a
   * schema and returns the appropriate type.
   */
  getBaseTypeFromSchema(e, n, i) {
    if (!e && typeof e != "boolean")
      return l.any;
    if (O(e))
      return this.getRefAlias(e, i);
    if (e === !0)
      return l.any;
    if (e === !1)
      return l.never;
    if (e.oneOf) {
      const r = { ...e };
      return delete r.oneOf, this.getUnionType(
        e.oneOf.map(
          (s) => (
            // ensure that base properties from the schema are included in the oneOf variants
            b.mergeWith({}, r, s, (c, f) => {
              if (b.isArray(c))
                return c.concat(f);
            })
          )
        ),
        e.discriminator,
        i
      );
    }
    if (e.anyOf)
      return this.getUnionType(e.anyOf, void 0, i);
    if (e.discriminator) {
      const r = e.discriminator.mapping || {};
      return this.getUnionType(
        Object.values(r).map((s) => ({ $ref: s })),
        void 0,
        i
      );
    }
    if (e.allOf) {
      const r = [];
      for (const s of e.allOf)
        if (O(s) && this.discriminatingSchemas.has(s.$ref)) {
          const f = this.resolve(s).discriminator, p = Object.entries(f.mapping || {}).find(
            ([, d]) => d === e["x-component-ref-path"]
          );
          if (p) {
            const [d] = p;
            r.push(
              o.createTypeLiteralNode([
                x({
                  name: f.propertyName,
                  type: o.createLiteralTypeNode(
                    o.createStringLiteral(d)
                  )
                })
              ])
            );
          }
          r.push(
            this.getRefAlias(
              s,
              i,
              /* ignoreDiscriminator */
              !0
            )
          );
        } else
          r.push(this.getTypeFromSchema(s, void 0, i));
      return (e.properties || e.additionalProperties) && r.push(
        this.getTypeFromProperties(
          e.properties || {},
          e.required,
          e.additionalProperties,
          i
        )
      ), o.createIntersectionTypeNode(r);
    }
    return "items" in e ? o.createArrayTypeNode(
      this.getTypeFromSchema(e.items, void 0, i)
    ) : "prefixItems" in e && e.prefixItems ? o.createTupleTypeNode(
      e.prefixItems.map((r) => this.getTypeFromSchema(r))
    ) : e.properties || e.additionalProperties ? this.getTypeFromProperties(
      e.properties || {},
      e.required,
      e.additionalProperties,
      i
    ) : e.enum ? this.isTrueEnum(e, n) ? this.getTrueEnum(e, n) : Z(e.enum) : e.format == "binary" ? o.createTypeReferenceNode("Blob", []) : e.const ? this.getTypeFromEnum([e.const]) : e.type ? Array.isArray(e.type) ? o.createUnionTypeNode(
      e.type.map((r) => r === "null" ? l.null : r === "integer" ? l.number : fe(r) ? l[r] : l.any)
    ) : e.type === "integer" ? l.number : fe(e.type) ? l[e.type] : l.any : l.any;
  }
  isTrueEnum(e, n) {
    return !!(typeof e != "boolean" && e.enum && this.opts.useEnumType && n && e.type !== "boolean");
  }
  /**
   * Creates literal type (or union) from an array of values
   */
  getTypeFromEnum(e) {
    const n = e.map((i) => {
      if (i === null)
        return l.null;
      if (typeof i == "boolean")
        return i ? o.createLiteralTypeNode(
          u.factory.createToken(u.SyntaxKind.TrueKeyword)
        ) : o.createLiteralTypeNode(
          u.factory.createToken(u.SyntaxKind.FalseKeyword)
        );
      if (typeof i == "number")
        return o.createLiteralTypeNode(o.createNumericLiteral(i));
      if (typeof i == "string")
        return o.createLiteralTypeNode(o.createStringLiteral(i));
      throw new Error(`Unexpected ${String(i)} of type ${typeof i} in enum`);
    });
    return n.length > 1 ? o.createUnionTypeNode(n) : n[0];
  }
  getEnumValuesString(e) {
    return e.join("_");
  }
  /*
    Creates a enum "ref" if not used, reuse existing if values and name matches or creates a new one
    with a new name adding a number
  */
  getTrueEnum(e, n) {
    if (typeof e == "boolean")
      throw new Error(
        "cannot get enum from boolean schema. schema must be an object"
      );
    const r = (e.title || b.upperFirst(n)).split(/[^A-Za-z0-9$_]/g).map((g) => b.upperFirst(g)).join(""), s = this.getEnumValuesString(
      e.enum ? e.enum : []
    ), c = this.getEnumUniqueAlias(r, s);
    if (this.enumRefs[r] && r === c)
      return this.enumRefs[r].type;
    const f = e.enum ? e.enum : [], p = e["x-enumNames"] ?? e["x-enum-varnames"];
    if (p) {
      if (!Array.isArray(p))
        throw new Error("enum names must be an array");
      if (p.length !== f.length)
        throw new Error("enum names must have the same length as enum values");
    }
    const d = f.map((g, T) => {
      if (e.type === "number" || e.type === "integer") {
        const N = p ? p[T] : String(g);
        return o.createEnumMember(
          o.createIdentifier(w(N, !0)),
          o.createNumericLiteral(g)
        );
      }
      return o.createEnumMember(
        o.createIdentifier(w(g, !0)),
        o.createStringLiteral(g)
      );
    });
    this.enumAliases.push(
      o.createEnumDeclaration([P.export], c, d)
    );
    const h = o.createTypeReferenceNode(c, void 0);
    return this.enumRefs[r] = {
      values: s,
      type: o.createTypeReferenceNode(c, void 0)
    }, h;
  }
  /**
   * Checks if readOnly/writeOnly properties are present in the given schema.
   * Returns a tuple of booleans; the first one is about readOnly, the second
   * one is about writeOnly.
   */
  checkSchemaOnlyMode(e, n = !0) {
    if (this.opts.mergeReadWriteOnly)
      return { readOnly: !1, writeOnly: !1 };
    const i = (r, s) => {
      if (O(r)) {
        if (!n)
          return { readOnly: !1, writeOnly: !1 };
        if (s.has(r.$ref))
          return { readOnly: !1, writeOnly: !1 };
        const d = this.refsOnlyMode.get(r.$ref);
        if (d)
          return d;
        s.add(r.$ref);
        const h = i(this.resolve(r), s);
        return s.delete(r.$ref), this.refsOnlyMode.set(r.$ref, h), h;
      }
      if (typeof r == "boolean")
        return { readOnly: !1, writeOnly: !1 };
      let c = r.readOnly ?? !1, f = r.writeOnly ?? !1;
      const p = [];
      "items" in r && r.items ? p.push(r.items) : (p.push(...Object.values(r.properties ?? {})), p.push(...r.allOf ?? []), p.push(...r.anyOf ?? []), p.push(...r.oneOf ?? []));
      for (const d of p) {
        if (c && f)
          break;
        const h = i(d, s);
        c = c || h.readOnly, f = f || h.writeOnly;
      }
      return { readOnly: c, writeOnly: f };
    };
    return i(e, /* @__PURE__ */ new Set());
  }
  /**
   * Recursively creates a type literal with the given props.
   */
  getTypeFromProperties(e, n, i, r) {
    const f = Object.keys(e).filter((p) => {
      const d = e[p], { readOnly: h, writeOnly: g } = this.checkSchemaOnlyMode(d, !1);
      switch (r) {
        case "readOnly":
          return h || !g;
        case "writeOnly":
          return g || !h;
        default:
          return !h && !g;
      }
    }).map((p) => {
      const d = e[p], h = n && n.includes(p);
      let g = this.getTypeFromSchema(d, p, r);
      !h && this.opts.unionUndefined && (g = o.createUnionTypeNode([g, l.undefined]));
      const T = x({
        questionToken: !h,
        name: p,
        type: g
      });
      if (typeof d != "boolean" && "description" in d && d.description) {
        const N = d.description.replace("*/", "*\\/");
        u.addSyntheticLeadingComment(
          T,
          u.SyntaxKind.MultiLineCommentTrivia,
          // Ensures it is formatted like a JSDoc comment: /** description here */
          `* ${N} `,
          !0
        );
      }
      return T;
    });
    if (i) {
      const p = i === !0 ? l.any : this.getTypeFromSchema(i, void 0, r);
      f.push(Se(p));
    }
    return o.createTypeLiteralNode(f);
  }
  getTypeFromResponses(e, n) {
    return o.createUnionTypeNode(
      Object.entries(e).map(([i, r]) => {
        const s = i === "default" ? l.number : o.createLiteralTypeNode(o.createNumericLiteral(i)), c = [
          x({
            name: "status",
            type: s
          })
        ], f = this.getTypeFromResponse(r, n);
        return f !== l.void && c.push(
          x({
            name: "data",
            type: f
          })
        ), o.createTypeLiteralNode(c);
      })
    );
  }
  getTypeFromResponse(e, n) {
    const i = this.resolve(e);
    return !i || !i.content ? l.void : this.getTypeFromSchema(
      this.getSchemaFromContent(i.content),
      void 0,
      n
    );
  }
  getResponseType(e) {
    if (!e)
      return "text";
    const n = Object.values(e).map(
      (r) => this.resolve(r)
    );
    return n.some(
      (r) => Object.keys(r.content ?? {}).length > 0
    ) ? n.some((r) => Object.keys(r.content ?? {}).some(G)) ? "json" : n.some(
      (r) => Object.keys(r.content ?? []).some((s) => s.startsWith("text/"))
    ) ? "text" : "blob" : "text";
  }
  getSchemaFromContent(e) {
    const n = Object.keys(e).find(Ue);
    if (n) {
      const { schema: i } = e[n];
      if (i)
        return i;
    }
    return Object.keys(e).length === 0 || Object.keys(e).some((i) => i.startsWith("text/")) ? { type: "string" } : { type: "string", format: "binary" };
  }
  getTypeFromParameter(e) {
    if (e.content) {
      const n = this.getSchemaFromContent(e.content);
      return this.getTypeFromSchema(n);
    }
    return this.getTypeFromSchema(O(e) ? e : e.schema);
  }
  wrapResult(e) {
    return this.opts?.optimistic ? z("ok", [e]) : e;
  }
  /**
   * Does three things:
   * 1. Add a `x-component-ref-path` property.
   * 2. Record discriminating schemas in `this.discriminatingSchemas`. A discriminating schema
   *    refers to a schema that has a `discriminator` property which is neither used in conjunction
   *    with `oneOf` nor `anyOf`.
   * 3. Make all mappings of discriminating schemas explicit to generate types immediately.
   */
  preprocessComponents(e) {
    const n = "#/components/schemas/";
    for (const r of Object.keys(e)) {
      const s = e[r];
      O(s) || typeof s == "boolean" || (s["x-component-ref-path"] = n + r, typeof s != "boolean" && s.discriminator && !s.oneOf && !s.anyOf && this.discriminatingSchemas.add(n + r));
    }
    const i = (r, s) => Object.values(r.mapping || {}).includes(s);
    for (const r of Object.keys(e)) {
      const s = e[r];
      if (!(O(s) || typeof s == "boolean" || !s.allOf))
        for (const c of s.allOf) {
          if (!O(c) || !this.discriminatingSchemas.has(c.$ref))
            continue;
          const p = e[R(c.$ref)].discriminator;
          i(p, n + r) || (p.mapping || (p.mapping = {}), p.mapping[r] = n + r);
        }
    }
  }
  generateApi() {
    this.reset();
    const e = u.createSourceFile(
      "ApiStub.ts",
      `/**
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */

import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";

export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
  headers: {},
  baseUrl: "/",
};

const oazapfts = Oazapfts.runtime(defaults);

export const servers = {};
`,
      // replaced with ApiStub.ts during build
      u.ScriptTarget.Latest,
      /*setParentNodes*/
      !1,
      u.ScriptKind.TS
    ), n = J(e.statements, "servers");
    Object.assign(n, {
      initializer: $e(this.spec.servers || [])
    });
    const { initializer: i } = J(
      e.statements,
      "defaults"
    );
    if (!i || !u.isObjectLiteralExpression(i))
      throw new Error("No object literal: defaults");
    we(
      i,
      "baseUrl",
      Pe(this.spec.servers || [])
    );
    const r = [], s = {};
    return this.spec.paths && Object.keys(this.spec.paths).forEach((c) => {
      if (!this.spec.paths)
        return;
      const f = this.spec.paths[c];
      f && Object.keys(this.resolve(f)).forEach((p) => {
        const d = p.toUpperCase();
        if (!Ie.includes(d))
          return;
        const h = f[p], {
          operationId: g,
          requestBody: T,
          responses: N,
          summary: ve,
          description: Ee,
          tags: Fe
        } = h;
        if (this.skip(Fe))
          return;
        let q = ze(p, c, g);
        const ie = s[q] = (s[q] || 0) + 1;
        ie > 1 && (q += ie);
        const D = this.resolveArray(f.parameters);
        for (const y of this.resolveArray(h.parameters))
          D.find(
            (L) => L.name === y.name && L.in === y.in
          ) || D.push(y);
        const K = this.isConverted ? We(D) : D, W = /* @__PURE__ */ new Map();
        b.sortBy(K, "name.length").forEach((y) => {
          const S = w(y.name), E = [...W.values()].includes(S) ? b.upperFirst(y.in) : "";
          W.set(y, S + E);
        });
        const A = (y) => {
          const S = W.get(y);
          if (!S)
            throw new Error(`Can't find parameter: ${y.name}`);
          return S;
        }, k = [];
        let j, v;
        switch (this.opts.argumentStyle ?? "positional") {
          case "positional":
            const [y, S] = b.partition(K, "required"), L = y.map(
              (m) => F(A(this.resolve(m)), {
                type: this.getTypeFromParameter(m)
              })
            );
            if (k.push(...L), T) {
              j = this.resolve(T);
              const m = this.getSchemaFromContent(j.content), I = this.getTypeFromSchema(
                m,
                void 0,
                "writeOnly"
              );
              v = w(
                I.name || ue(m) || "body"
              ), k.push(
                F(v, {
                  type: I,
                  questionToken: !j.required
                })
              );
            }
            S.length && k.push(
              F(
                V(
                  S.map((m) => this.resolve(m)).map((m) => ({ name: A(m) }))
                ),
                {
                  initializer: o.createObjectLiteralExpression(),
                  type: o.createTypeLiteralNode(
                    S.map(
                      (m) => x({
                        name: A(this.resolve(m)),
                        questionToken: !0,
                        type: this.getTypeFromParameter(m)
                      })
                    )
                  )
                }
              )
            );
            break;
          case "object":
            const E = K.map(
              (m) => x({
                name: A(this.resolve(m)),
                questionToken: !m.required,
                type: this.getTypeFromParameter(m)
              })
            );
            if (T) {
              j = this.resolve(T);
              const m = this.getSchemaFromContent(j.content), I = this.getTypeFromSchema(
                m,
                void 0,
                "writeOnly"
              );
              v = w(
                I.name || ue(m) || "body"
              ), E.push(
                x({
                  name: v,
                  questionToken: !j.required,
                  type: I
                })
              );
            }
            if (E.length === 0)
              break;
            k.push(
              F(
                V([
                  ...K.map((m) => this.resolve(m)).map((m) => ({ name: A(m) })),
                  ...v ? [{ name: v }] : []
                ]),
                {
                  type: o.createTypeLiteralNode(E)
                }
              )
            );
            break;
        }
        k.push(
          F("opts", {
            type: o.createTypeReferenceNode(
              "Oazapfts.RequestOpts",
              void 0
            ),
            questionToken: !0
          })
        );
        const Q = this.getResponseType(N), se = K.filter((y) => y.in === "query"), oe = K.filter((y) => y.in === "header");
        let ae;
        if (se.length) {
          const y = b.groupBy(se, qe);
          ae = pe(
            "query",
            Object.entries(y).map(([S, L]) => pe(S, [
              ee(
                L.map((E) => [E.name, A(E)])
              )
            ]))
          );
        }
        const Ae = He(c, ae), $ = [
          o.createSpreadAssignment(o.createIdentifier("opts"))
        ];
        d !== "GET" && $.push(
          o.createPropertyAssignment(
            "method",
            o.createStringLiteral(d)
          )
        ), v && $.push(
          M(
            "body",
            o.createIdentifier(v)
          )
        ), oe.length && $.push(
          o.createPropertyAssignment(
            "headers",
            z("mergeHeaders", [
              o.createPropertyAccessChain(
                o.createIdentifier("opts"),
                o.createToken(u.SyntaxKind.QuestionDotToken),
                "headers"
              ),
              o.createObjectLiteralExpression(
                [
                  ...oe.map(
                    (y) => M(
                      y.name,
                      o.createIdentifier(A(y))
                    )
                  )
                ],
                !0
              )
            ])
          )
        );
        const ce = [Ae];
        if ($.length) {
          const y = Ce(j), S = o.createObjectLiteralExpression($, !0);
          ce.push(
            y ? z(y, [S]) : S
          );
        }
        r.push(
          xe(
            ge(
              q,
              {
                modifiers: [P.export]
              },
              k,
              me(
                o.createReturnStatement(
                  this.wrapResult(
                    z(
                      {
                        json: "fetchJson",
                        text: "fetchText",
                        blob: "fetchBlob"
                      }[Q],
                      ce,
                      Q === "json" || Q === "blob" ? [
                        this.getTypeFromResponses(
                          N,
                          "readOnly"
                        ) || u.SyntaxKind.AnyKeyword
                      ] : void 0
                    )
                  )
                )
              )
            ),
            ve || Ee
          )
        );
      });
    }), Object.assign(e, {
      statements: Ne(
        e.statements,
        ...this.aliases,
        ...r,
        ...this.enumAliases
      )
    }), e;
  }
}
const a = u.factory, ye = a.createToken(u.SyntaxKind.QuestionToken);
function _(t) {
  if (t)
    return t === !0 ? ye : t;
}
const l = {
  any: a.createKeywordTypeNode(u.SyntaxKind.AnyKeyword),
  number: a.createKeywordTypeNode(u.SyntaxKind.NumberKeyword),
  object: a.createKeywordTypeNode(u.SyntaxKind.ObjectKeyword),
  string: a.createKeywordTypeNode(u.SyntaxKind.StringKeyword),
  boolean: a.createKeywordTypeNode(u.SyntaxKind.BooleanKeyword),
  undefined: a.createKeywordTypeNode(u.SyntaxKind.UndefinedKeyword),
  void: a.createKeywordTypeNode(u.SyntaxKind.VoidKeyword),
  never: a.createKeywordTypeNode(u.SyntaxKind.NeverKeyword),
  null: a.createLiteralTypeNode(a.createNull())
};
function Qe(t) {
  return l[t];
}
const P = {
  async: a.createModifier(u.SyntaxKind.AsyncKeyword),
  export: a.createModifier(u.SyntaxKind.ExportKeyword)
};
function Y(t) {
  switch (typeof t) {
    case "string":
      return a.createStringLiteral(t);
    case "boolean":
      return t ? a.createTrue() : a.createFalse();
    case "number":
      return String(t).charAt(0) === "-" ? a.createPrefixUnaryExpression(
        u.SyntaxKind.MinusToken,
        a.createNumericLiteral(String(-t))
      ) : a.createNumericLiteral(String(t));
  }
}
function Z(t) {
  const e = t.map(
    (n) => n === null ? l.null : a.createLiteralTypeNode(Y(n))
  );
  return e.length > 1 ? a.createUnionTypeNode(e) : e[0];
}
function B({
  modifiers: t,
  name: e,
  typeParameters: n,
  type: i
}) {
  return a.createTypeAliasDeclaration(
    t,
    e,
    n,
    i
  );
}
function Je({
  modifiers: t,
  name: e,
  typeParameters: n,
  type: i,
  inheritedNodeNames: r
}) {
  const s = r ? [
    a.createHeritageClause(
      u.SyntaxKind.ExtendsKeyword,
      r.map((c) => {
        const f = typeof c == "string" ? c : c.escapedText.toString();
        return a.createExpressionWithTypeArguments(
          a.createIdentifier(
            w(f, !0)
          ),
          void 0
        );
      })
    )
  ] : [];
  return a.createInterfaceDeclaration(
    t,
    e,
    n,
    s,
    i.members
  );
}
function X(t) {
  return typeof t == "string" ? a.createIdentifier(t) : t;
}
function C(t, {
  typeArgs: e,
  args: n
} = {}) {
  return a.createCallExpression(X(t), e, n);
}
function Ge(t, e) {
  return C(
    a.createPropertyAccessExpression(a.createThis(), t),
    e
  );
}
function ee(t) {
  return a.createObjectLiteralExpression(
    t.map(
      ([e, n]) => M(e, X(n))
    ),
    !0
  );
}
function M(t, e) {
  return u.isIdentifier(e) && e.text === t ? a.createShorthandPropertyAssignment(t) : a.createPropertyAssignment(Te(t), e);
}
function me(...t) {
  return a.createBlock(t, !0);
}
function he(t, e, {
  modifiers: n,
  typeParameters: i,
  type: r,
  equalsGreaterThanToken: s
} = {}) {
  return a.createArrowFunction(
    n,
    i,
    t,
    r,
    s,
    e
  );
}
function ge(t, {
  modifiers: e,
  asteriskToken: n,
  typeParameters: i,
  type: r
}, s, c) {
  return a.createFunctionDeclaration(
    e,
    n,
    t,
    i,
    s,
    r,
    c
  );
}
function Ye({
  modifiers: t,
  name: e,
  typeParameters: n,
  heritageClauses: i,
  members: r
}) {
  return a.createClassDeclaration(
    t,
    e,
    n,
    i,
    r
  );
}
function Ze({
  modifiers: t,
  parameters: e,
  body: n
}) {
  return a.createConstructorDeclaration(t, e, n);
}
function Xe(t, {
  modifiers: e,
  asteriskToken: n,
  questionToken: i,
  typeParameters: r,
  type: s
} = {}, c = [], f) {
  return a.createMethodDeclaration(
    e,
    n,
    t,
    _(i),
    r,
    c,
    s,
    f
  );
}
function F(t, {
  modifiers: e,
  dotDotDotToken: n,
  questionToken: i,
  type: r,
  initializer: s
}) {
  return a.createParameterDeclaration(
    e,
    n,
    t,
    _(i),
    r,
    s
  );
}
function Te(t) {
  return typeof t == "string" ? H(t) ? a.createIdentifier(t) : a.createStringLiteral(t) : t;
}
function x({
  modifiers: t,
  name: e,
  questionToken: n,
  type: i
}) {
  return a.createPropertySignature(
    t,
    Te(e),
    _(n),
    i
  );
}
function Se(t, {
  modifiers: e,
  indexName: n = "key",
  indexType: i = l.string
} = {}) {
  return a.createIndexSignature(
    e,
    [F(n, { type: i })],
    t
  );
}
function V(t) {
  return a.createObjectBindingPattern(
    t.map(
      ({ dotDotDotToken: e, propertyName: n, name: i, initializer: r }) => a.createBindingElement(
        e,
        n,
        i,
        r
      )
    )
  );
}
function te(t, e) {
  return e.length ? a.createTemplateExpression(
    a.createTemplateHead(t),
    e.map(
      ({ expression: n, literal: i }, r) => a.createTemplateSpan(
        n,
        r === e.length - 1 ? a.createTemplateTail(i) : a.createTemplateMiddle(i)
      )
    )
  ) : a.createStringLiteral(t);
}
function be(t, e, n) {
  const i = t.find(
    (r) => r.kind === e && (!n || n(r))
  );
  if (!i)
    throw new Error(`Node not found: ${e}`);
  return i;
}
function re(t) {
  return u.isIdentifier(t) ? t.escapedText : u.isLiteralExpression(t) ? t.text : "";
}
function Oe(t) {
  const e = u.getNameOfDeclaration(t.declarationList.declarations[0]);
  return e ? re(e) : "";
}
function J(t, e) {
  const n = be(
    t,
    u.SyntaxKind.VariableStatement,
    (r) => Oe(r) === e
  ), [i] = n.declarationList.declarations;
  if (!i)
    throw new Error("Missing declaration");
  return i;
}
function we(t, e, n) {
  const i = t.properties.find(
    (r) => u.isPropertyAssignment(r) && re(r.name) === e
  );
  if (i && u.isPropertyAssignment(i))
    Object.assign(i, { initializer: n });
  else
    throw new Error(`No such property: ${e}`);
}
function Ne(t, ...e) {
  return a.createNodeArray([...t, ...e]);
}
function xe(t, e) {
  return e ? u.addSyntheticLeadingComment(
    t,
    u.SyntaxKind.MultiLineCommentTrivia,
    `*
 * ${e.replace(/\n/g, `
 * `)}
 `,
    !0
  ) : t;
}
const ne = u.createPrinter({
  newLine: u.NewLineKind.LineFeed
});
function et(t) {
  const e = u.createSourceFile(
    "someFileName.ts",
    "",
    u.ScriptTarget.Latest,
    /*setParentNodes*/
    !1,
    u.ScriptKind.TS
  );
  return ne.printNode(u.EmitHint.Unspecified, t, e);
}
function tt(t) {
  const e = u.createSourceFile(
    "someFileName.ts",
    "",
    u.ScriptTarget.Latest,
    /*setParentNodes*/
    !1,
    u.ScriptKind.TS
  );
  return t.map((n) => ne.printNode(u.EmitHint.Unspecified, n, e)).join(`
`);
}
function rt(t) {
  return ne.printFile(t);
}
function H(t) {
  if (!t.length || t.trim() !== t)
    return !1;
  const e = u.parseIsolatedEntityName(t, u.ScriptTarget.Latest);
  return !!e && e.kind === u.SyntaxKind.Identifier && u.identifierToKeywordKind(e) === void 0;
}
const ot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addComment: xe,
  appendNodes: Ne,
  block: me,
  changePropertyValue: we,
  createArrowFunction: he,
  createCall: C,
  createClassDeclaration: Ye,
  createConstructor: Ze,
  createEnumTypeNode: Z,
  createFunctionDeclaration: ge,
  createIndexSignature: Se,
  createInterfaceAliasDeclaration: Je,
  createKeywordType: Qe,
  createLiteral: Y,
  createMethod: Xe,
  createMethodCall: Ge,
  createObjectBinding: V,
  createObjectLiteral: ee,
  createParameter: F,
  createPropertyAssignment: M,
  createPropertySignature: x,
  createQuestionToken: _,
  createTemplateString: te,
  createTypeAliasDeclaration: B,
  findFirstVariableDeclaration: J,
  findNode: be,
  getFirstDeclarationName: Oe,
  getName: re,
  isValidIdentifier: H,
  keywordType: l,
  modifier: P,
  printFile: rt,
  printNode: et,
  printNodes: tt,
  questionToken: ye,
  toExpression: X
}, Symbol.toStringTag, { value: "Module" }));
export {
  H as $,
  st as A,
  Je as B,
  X as C,
  C as D,
  Ge as E,
  ee as F,
  M as G,
  me as H,
  he as I,
  ge as J,
  Ye as K,
  Ze as L,
  Xe as M,
  F as N,
  x as O,
  Se as P,
  V as Q,
  te as R,
  be as S,
  re as T,
  Oe as U,
  J as V,
  we as W,
  Ne as X,
  xe as Y,
  et as Z,
  tt as _,
  G as a,
  Pe as a0,
  qe as b,
  De as c,
  ze as d,
  Be as e,
  O as f,
  Ce as g,
  ue as h,
  Ue as i,
  w as j,
  He as k,
  pe as l,
  z as m,
  _ as n,
  l as o,
  rt as p,
  ye as q,
  de as r,
  We as s,
  ot as t,
  Qe as u,
  Ie as v,
  P as w,
  Y as x,
  Z as y,
  B as z
};
//# sourceMappingURL=tscodegen-mzC1xESn.js.map
