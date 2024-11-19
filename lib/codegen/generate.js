'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.supportDeepObjects =
  exports.callOazapftsFunction =
  exports.callQsFunction =
  exports.createUrlExpression =
  exports.toIdentifier =
  exports.getReferenceName =
  exports.refPathToPropertyPath =
  exports.isReference =
  exports.isNullable =
  exports.getOperationName =
  exports.getOperationIdentifier =
  exports.getFormatter =
  exports.getBodyFormatter =
  exports.isJsonMimeType =
  exports.isMimeType =
  exports.verbs =
    void 0;
const lodash_1 = __importDefault(require('lodash'));
const typescript_1 = __importStar(require('typescript'));
const path_1 = __importDefault(require('path'));
const cg = __importStar(require('./tscodegen'));
const generateServers_1 = __importStar(require('./generateServers'));
exports.verbs = [
  'GET',
  'PUT',
  'POST',
  'DELETE',
  'OPTIONS',
  'HEAD',
  'PATCH',
  'TRACE',
];
const contentTypes = {
  '*/*': 'json',
  'application/json': 'json',
  'application/x-www-form-urlencoded': 'form',
  'multipart/form-data': 'multipart',
};
function isMimeType(s) {
  return typeof s === 'string' && /^[^/]+\/[^/]+$/.test(s);
}
exports.isMimeType = isMimeType;
function isJsonMimeType(mime) {
  return contentTypes[mime] === 'json' || /\bjson\b/i.test(mime);
}
exports.isJsonMimeType = isJsonMimeType;
function getBodyFormatter(body) {
  if (body === null || body === void 0 ? void 0 : body.content) {
    for (const contentType of Object.keys(body.content)) {
      const formatter = contentTypes[contentType];
      if (formatter) return formatter;
      if (isJsonMimeType(contentType)) return 'json';
    }
  }
}
exports.getBodyFormatter = getBodyFormatter;
/**
 * Get the name of a formatter function for a given parameter.
 */
function getFormatter({ style = 'form', explode = true, content }) {
  if (content) {
    const medias = Object.keys(content);
    if (medias.length !== 1) {
      throw new Error(
        'Parameters with content property must specify one media type',
      );
    }
    if (!isJsonMimeType(medias[0])) {
      throw new Error(
        'Parameters with content property must specify a JSON compatible media type',
      );
    }
    return 'json';
  }
  if (explode && style === 'deepObject') return 'deep';
  if (explode) return 'explode';
  if (style === 'spaceDelimited') return 'space';
  if (style === 'pipeDelimited') return 'pipe';
  return 'form';
}
exports.getFormatter = getFormatter;
function getOperationIdentifier(id) {
  if (!id) return;
  if (id.match(/[^\w\s]/)) return;
  id = lodash_1.default.camelCase(id);
  if (cg.isValidIdentifier(id)) return id;
}
exports.getOperationIdentifier = getOperationIdentifier;
/**
 * Create a method name for a given operation, either from its operationId or
 * the HTTP verb and path.
 */
function getOperationName(verb, path, operationId) {
  const id = getOperationIdentifier(operationId);
  if (id) return id;
  path = path.replace(/\{(.+?)\}/, 'by $1').replace(/\{(.+?)\}/, 'and $1');
  return toIdentifier(`${verb} ${path}`);
}
exports.getOperationName = getOperationName;
function isNullable(schema) {
  return schema && !isReference(schema) && schema.nullable;
}
exports.isNullable = isNullable;
function isReference(obj) {
  return typeof obj === 'object' && obj !== null && '$ref' in obj;
}
exports.isReference = isReference;
/**
 * Converts a local reference path into an array of property names.
 */
function refPathToPropertyPath(ref) {
  if (!ref.startsWith('#/')) {
    throw new Error(
      `External refs are not supported (${ref}). Make sure to call SwaggerParser.bundle() first.`,
    );
  }
  return ref
    .slice(2)
    .split('/')
    .map(s => decodeURI(s.replace(/~1/g, '/').replace(/~0/g, '~')));
}
exports.refPathToPropertyPath = refPathToPropertyPath;
/**
 * Get the last path component of the given ref.
 */
function getRefBasename(ref) {
  return ref.replace(/.+\//, '');
}
/**
 * Returns a name for the given ref that can be used as basis for a type
 * alias. This usually is the baseName, unless the ref starts with a number,
 * in which case the whole ref is returned, with slashes turned into
 * underscores.
 */
function getRefName(ref) {
  const base = getRefBasename(ref);
  if (/^\d+/.test(base)) {
    return refPathToPropertyPath(ref).join('_');
  }
  return base;
}
/**
 * If the given object is a ReferenceObject, return the last part of its path.
 */
function getReferenceName(obj) {
  if (isReference(obj)) {
    return getRefBasename(obj.$ref);
  }
}
exports.getReferenceName = getReferenceName;
const onlyModeSuffixes = {
  readOnly: 'Read',
  writeOnly: 'Write',
};
function getOnlyModeSuffix(onlyMode) {
  if (!onlyMode) return '';
  return onlyModeSuffixes[onlyMode];
}
function toIdentifier(s, upperFirst = false, onlyMode) {
  let cc = lodash_1.default.camelCase(s) + getOnlyModeSuffix(onlyMode);
  if (upperFirst) cc = lodash_1.default.upperFirst(cc);
  if (cg.isValidIdentifier(cc)) return cc;
  return '$' + cc;
}
exports.toIdentifier = toIdentifier;
/**
 * Create a template string literal from the given OpenAPI urlTemplate.
 * Curly braces in the path are turned into identifier expressions,
 * which are read from the local scope during runtime.
 */
function createUrlExpression(path, qs) {
  const spans = [];
  // Use a replacer function to collect spans as a side effect:
  const head = path.replace(
    /(.*?)\{(.+?)\}(.*?)(?=\{|$)/g,
    (_substr, head, name, literal) => {
      const expression = toIdentifier(name);
      spans.push({
        expression: cg.createCall(
          typescript_1.factory.createIdentifier('encodeURIComponent'),
          { args: [typescript_1.factory.createIdentifier(expression)] },
        ),
        literal,
      });
      return head;
    },
  );
  if (qs) {
    // add the query string as last span
    spans.push({ expression: qs, literal: '' });
  }
  return cg.createTemplateString(head, spans);
}
exports.createUrlExpression = createUrlExpression;
/**
 * Create a call expression for one of the QS runtime functions.
 */
function callQsFunction(name, args) {
  return cg.createCall(
    typescript_1.factory.createPropertyAccessExpression(
      typescript_1.factory.createIdentifier('QS'),
      name,
    ),
    { args },
  );
}
exports.callQsFunction = callQsFunction;
/**
 * Create a call expression for one of the oazapfts runtime functions.
 */
function callOazapftsFunction(name, args, typeArgs) {
  return cg.createCall(
    typescript_1.factory.createPropertyAccessExpression(
      typescript_1.factory.createIdentifier('oazapfts'),
      name,
    ),
    { args, typeArgs },
  );
}
exports.callOazapftsFunction = callOazapftsFunction;
/**
 * Despite its name, OpenApi's `deepObject` serialization does not support
 * deeply nested objects. As a workaround we detect parameters that contain
 * square brackets and merge them into a single object.
 */
function supportDeepObjects(params) {
  const res = [];
  const merged = {};
  params.forEach(p => {
    const m = /^(.+?)\[(.*?)\]/.exec(p.name);
    if (!m) {
      res.push(p);
      return;
    }
    const [, name, prop] = m;
    let obj = merged[name];
    if (!obj) {
      obj = merged[name] = {
        name,
        in: p.in,
        style: 'deepObject',
        schema: {
          type: 'object',
          properties: {},
        },
      };
      res.push(obj);
    }
    obj.schema.properties[prop] = p.schema;
  });
  return res;
}
exports.supportDeepObjects = supportDeepObjects;
/**
 * Main entry point that generates TypeScript code from a given API spec.
 */
class ApiGenerator {
  constructor(
    spec,
    opts = {},
    /** Indicates if the document was converted from an older version of the OpenAPI specification. */
    isConverted = false,
  ) {
    var _a;
    this.spec = spec;
    this.opts = opts;
    this.isConverted = isConverted;
    // see `preprocessComponents` for the definition of a discriminating schema
    this.discriminatingSchemas = new Set();
    this.aliases = [];
    this.enumAliases = [];
    this.enumRefs = {};
    // Collect the types of all referenced schemas so we can export them later
    // Referenced schemas can be pointing at the following versions:
    // - "base": The regular type/interface e.g. ExampleSchema
    // - "readOnly": The readOnly version e.g. ExampleSchemaRead
    // - "writeOnly": The writeOnly version e.g. ExampleSchemaWrite
    this.refs = {};
    // Maps a referenced schema to its readOnly/writeOnly status
    // This field should be used exclusively within the `checkSchemaOnlyMode` method
    this.refsOnlyMode = new Map();
    // Keep track of already used type aliases
    this.typeAliases = {};
    if (
      (_a = this.spec.components) === null || _a === void 0
        ? void 0
        : _a.schemas
    ) {
      this.preprocessComponents(this.spec.components.schemas);
    }
  }
  reset() {
    this.aliases = [];
    this.enumAliases = [];
    this.refs = {};
    this.typeAliases = {};
  }
  resolve(obj) {
    if (!isReference(obj)) return obj;
    const ref = obj.$ref;
    const path = refPathToPropertyPath(ref);
    const resolved = lodash_1.default.get(this.spec, path);
    if (typeof resolved === 'undefined') {
      throw new Error(`Can't find ${path}`);
    }
    return resolved;
  }
  resolveArray(array) {
    return array ? array.map(el => this.resolve(el)) : [];
  }
  skip(tags) {
    var _a;
    const excluded =
      tags &&
      tags.some(t => {
        var _a, _b;
        return (_b =
          (_a = this.opts) === null || _a === void 0 ? void 0 : _a.exclude) ===
          null || _b === void 0
          ? void 0
          : _b.includes(t);
      });
    if (excluded) {
      return true;
    }
    if ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.include) {
      const included =
        tags &&
        tags.some(t => {
          var _a;
          return (_a = this.opts.include) === null || _a === void 0
            ? void 0
            : _a.includes(t);
        });
      return !included;
    }
    return false;
  }
  findAvailableRef(ref) {
    const available = ref => {
      try {
        this.resolve({ $ref: ref });
        return false;
      } catch (error) {
        return true;
      }
    };
    if (available(ref)) return ref;
    let i = 2;
    while (true) {
      const key = ref + String(i);
      if (available(key)) return key;
      i += 1;
    }
  }
  getUniqueAlias(name) {
    let used = this.typeAliases[name] || 0;
    if (used) {
      this.typeAliases[name] = ++used;
      name += used;
    }
    this.typeAliases[name] = 1;
    return name;
  }
  getEnumUniqueAlias(name, values) {
    // If enum name already exists and have the same values
    if (this.enumRefs[name] && this.enumRefs[name].values == values) {
      return name;
    }
    return this.getUniqueAlias(name);
  }
  /**
   * Create a type alias for the schema referenced by the given ReferenceObject
   */
  getRefAlias(
    obj,
    onlyMode,
    // If true, the discriminator property of the schema referenced by `obj` will be ignored.
    // This is meant to be used when getting the type of a discriminating schema in an `allOf`
    // construct.
    ignoreDiscriminator,
  ) {
    var _a;
    const $ref = ignoreDiscriminator
      ? this.findAvailableRef(obj.$ref + 'Base')
      : obj.$ref;
    if (!this.refs[$ref]) {
      let schema = this.resolve(obj);
      if (ignoreDiscriminator) {
        schema = lodash_1.default.cloneDeep(schema);
        delete schema.discriminator;
      }
      const name = schema.title || getRefName($ref);
      const identifier = toIdentifier(name, true);
      // When this is a true enum we can reference it directly,
      // no need to create a type alias
      if (this.isTrueEnum(schema, name)) {
        return this.getTypeFromSchema(schema, name);
      }
      const alias = this.getUniqueAlias(identifier);
      this.refs[$ref] = {
        base: typescript_1.factory.createTypeReferenceNode(alias, undefined),
        readOnly: undefined,
        writeOnly: undefined,
      };
      const type = this.getTypeFromSchema(schema, undefined);
      this.aliases.push(
        cg.createTypeAliasDeclaration({
          modifiers: [cg.modifier.export],
          name: alias,
          type,
        }),
      );
      const { readOnly, writeOnly } = this.checkSchemaOnlyMode(schema);
      if (readOnly) {
        const readOnlyAlias = this.getUniqueAlias(
          toIdentifier(name, true, 'readOnly'),
        );
        this.refs[$ref]['readOnly'] =
          typescript_1.factory.createTypeReferenceNode(
            readOnlyAlias,
            undefined,
          );
        const readOnlyType = this.getTypeFromSchema(schema, name, 'readOnly');
        this.aliases.push(
          cg.createTypeAliasDeclaration({
            modifiers: [cg.modifier.export],
            name: readOnlyAlias,
            type: readOnlyType,
          }),
        );
      }
      if (writeOnly) {
        const writeOnlyAlias = this.getUniqueAlias(
          toIdentifier(name, true, 'writeOnly'),
        );
        this.refs[$ref]['writeOnly'] =
          typescript_1.factory.createTypeReferenceNode(
            writeOnlyAlias,
            undefined,
          );
        const writeOnlyType = this.getTypeFromSchema(schema, name, 'writeOnly');
        this.aliases.push(
          cg.createTypeAliasDeclaration({
            modifiers: [cg.modifier.export],
            name: writeOnlyAlias,
            type: writeOnlyType,
          }),
        );
      }
    }
    // If not ref fallback to the regular reference
    return (_a = this.refs[$ref][onlyMode || 'base']) !== null && _a !== void 0
      ? _a
      : this.refs[$ref].base;
  }
  getSchemaProperties(schema) {
    if (
      (schema === null || schema === void 0 ? void 0 : schema.allOf) &&
      !isReference(
        schema === null || schema === void 0 ? void 0 : schema.allOf[0],
      )
    ) {
      return schema.allOf[0].properties;
    }
    if (
      (schema === null || schema === void 0 ? void 0 : schema.oneOf) &&
      !isReference(
        schema === null || schema === void 0 ? void 0 : schema.oneOf[0],
      )
    ) {
      return schema.oneOf[0].properties;
    }
    if (
      (schema === null || schema === void 0 ? void 0 : schema.anyOf) &&
      !isReference(
        schema === null || schema === void 0 ? void 0 : schema.anyOf[0],
      )
    ) {
      return schema.anyOf[0].properties;
    }
    return schema.properties;
  }
  getUnionType(variants, discriminator, onlyMode) {
    if (discriminator) {
      // oneOf + discriminator -> tagged union (polymorphism)
      if (discriminator.propertyName === undefined) {
        throw new Error('Discriminators require a propertyName');
      }
      // By default, the last component of the ref name (i.e., after the last trailing slash) is
      // used as the discriminator value for each variant. This can be overridden using the
      // discriminator.mapping property.
      const mappedValues = new Set(
        Object.values(discriminator.mapping || {}).map(getRefBasename),
      );
      return typescript_1.factory.createUnionTypeNode(
        [
          ...Object.entries(discriminator.mapping || {}).map(
            ([discriminatorValue, variantRef]) => [
              discriminatorValue,
              { $ref: variantRef },
            ],
          ),
          ...variants
            .filter(variant => {
              if (!isReference(variant)) {
                // From the Swagger spec: "When using the discriminator, inline schemas will not be
                // considered."
                throw new Error(
                  'Discriminators require references, not inline schemas',
                );
              }
              return !mappedValues.has(getRefBasename(variant.$ref));
            })
            .map(schema => {
              var _a;
              const schemaBaseName = getRefBasename(schema.$ref);
              const resolvedSchema = this.resolve(schema);
              const properties = this.getSchemaProperties(resolvedSchema);
              const discriminatorProperty =
                properties === null || properties === void 0
                  ? void 0
                  : properties[discriminator.propertyName];
              const variantName =
                discriminatorProperty && 'enum' in discriminatorProperty
                  ? (_a =
                      discriminatorProperty === null ||
                      discriminatorProperty === void 0
                        ? void 0
                        : discriminatorProperty.enum) === null || _a === void 0
                    ? void 0
                    : _a[0]
                  : '';
              return [variantName || schemaBaseName, schema];
            }),
        ].map(([discriminatorValue, variant]) =>
          // Yields: { [discriminator.propertyName]: discriminatorValue } & variant
          typescript_1.factory.createIntersectionTypeNode([
            typescript_1.factory.createTypeLiteralNode([
              cg.createPropertySignature({
                name: discriminator.propertyName,
                type: typescript_1.factory.createLiteralTypeNode(
                  typescript_1.factory.createStringLiteral(discriminatorValue),
                ),
              }),
            ]),
            this.getTypeFromSchema(variant, undefined, onlyMode),
          ]),
        ),
      );
    } else {
      // oneOf -> untagged union
      return typescript_1.factory.createUnionTypeNode(
        variants.map(schema =>
          this.getTypeFromSchema(schema, undefined, onlyMode),
        ),
      );
    }
  }
  /**
   * Creates a type node from a given schema.
   * Delegates to getBaseTypeFromSchema internally and
   * optionally adds a union with null.
   */
  getTypeFromSchema(schema, name, onlyMode) {
    const type = this.getBaseTypeFromSchema(schema, name, onlyMode);
    return isNullable(schema)
      ? typescript_1.factory.createUnionTypeNode([type, cg.keywordType.null])
      : type;
  }
  /**
   * This is the very core of the OpenAPI to TS conversion - it takes a
   * schema and returns the appropriate type.
   */
  getBaseTypeFromSchema(schema, name, onlyMode) {
    if (!schema) return cg.keywordType.any;
    if (isReference(schema)) {
      return this.getRefAlias(schema, onlyMode);
    }
    if (schema.oneOf) {
      const clone = Object.assign({}, schema);
      delete clone.oneOf;
      // oneOf -> union
      return this.getUnionType(
        schema.oneOf.map(variant =>
          // ensure that base properties from the schema are included in the oneOf variants
          lodash_1.default.mergeWith(
            {},
            clone,
            variant,
            (objValue, srcValue) => {
              if (lodash_1.default.isArray(objValue)) {
                return objValue.concat(srcValue);
              }
            },
          ),
        ),
        schema.discriminator,
        onlyMode,
      );
    }
    if (schema.anyOf) {
      // anyOf -> union
      return this.getUnionType(schema.anyOf, undefined, onlyMode);
    }
    if (schema.discriminator) {
      // discriminating schema -> union
      const mapping = schema.discriminator.mapping || {};
      return this.getUnionType(
        Object.values(mapping).map(ref => ({ $ref: ref })),
        undefined,
        onlyMode,
      );
    }
    if (schema.allOf) {
      // allOf -> intersection
      const types = [];
      for (const childSchema of schema.allOf) {
        if (
          isReference(childSchema) &&
          this.discriminatingSchemas.has(childSchema.$ref)
        ) {
          const discriminatingSchema = this.resolve(childSchema);
          const discriminator = discriminatingSchema.discriminator;
          const matched = Object.entries(discriminator.mapping || {}).find(
            ([, ref]) => ref === schema['x-component-ref-path'],
          );
          if (matched) {
            const [discriminatorValue] = matched;
            types.push(
              typescript_1.factory.createTypeLiteralNode([
                cg.createPropertySignature({
                  name: discriminator.propertyName,
                  type: typescript_1.factory.createLiteralTypeNode(
                    typescript_1.factory.createStringLiteral(
                      discriminatorValue,
                    ),
                  ),
                }),
              ]),
            );
          }
          types.push(
            this.getRefAlias(
              childSchema,
              onlyMode,
              /* ignoreDiscriminator */ true,
            ),
          );
        } else {
          types.push(this.getTypeFromSchema(childSchema, undefined, onlyMode));
        }
      }
      if (schema.properties || schema.additionalProperties) {
        // properties -> literal type
        types.push(
          this.getTypeFromProperties(
            schema.properties || {},
            schema.required,
            schema.additionalProperties,
            onlyMode,
          ),
        );
      }
      return typescript_1.factory.createIntersectionTypeNode(types);
    }
    if ('items' in schema) {
      // items -> array
      return typescript_1.factory.createArrayTypeNode(
        this.getTypeFromSchema(schema.items, undefined, onlyMode),
      );
    }
    if ('prefixItems' in schema && schema.prefixItems) {
      // prefixItems -> typed tuple
      return typescript_1.factory.createTupleTypeNode(
        schema.prefixItems.map(schema => this.getTypeFromSchema(schema)),
      );
    }
    if (schema.properties || schema.additionalProperties) {
      // properties -> literal type
      return this.getTypeFromProperties(
        schema.properties || {},
        schema.required,
        schema.additionalProperties,
        onlyMode,
      );
    }
    if (schema.enum) {
      // enum -> enum or union
      return this.isTrueEnum(schema, name)
        ? this.getTrueEnum(schema, name)
        : cg.createEnumTypeNode(schema.enum);
    }
    if (schema.format == 'binary') {
      return typescript_1.factory.createTypeReferenceNode('Blob', []);
    }
    if (schema.const) {
      return this.getTypeFromEnum([schema.const]);
    }
    if (schema.type) {
      // string, boolean, null, number
      if (schema.type === 'integer') return cg.keywordType.number;
      if (schema.type in cg.keywordType) return cg.keywordType[schema.type];
    }
    return cg.keywordType.any;
  }
  isTrueEnum(schema, name) {
    return Boolean(
      schema.enum && this.opts.useEnumType && name && schema.type !== 'boolean',
    );
  }
  /**
   * Creates literal type (or union) from an array of values
   */
  getTypeFromEnum(values) {
    const types = values.map(s => {
      if (s === null) return cg.keywordType.null;
      if (typeof s === 'boolean')
        return s
          ? typescript_1.factory.createLiteralTypeNode(
              typescript_1.default.factory.createToken(
                typescript_1.default.SyntaxKind.TrueKeyword,
              ),
            )
          : typescript_1.factory.createLiteralTypeNode(
              typescript_1.default.factory.createToken(
                typescript_1.default.SyntaxKind.FalseKeyword,
              ),
            );
      if (typeof s === 'number')
        return typescript_1.factory.createLiteralTypeNode(
          typescript_1.factory.createNumericLiteral(s),
        );
      if (typeof s === 'string')
        return typescript_1.factory.createLiteralTypeNode(
          typescript_1.factory.createStringLiteral(s),
        );
      throw new Error(`Unexpected ${String(s)} of type ${typeof s} in enum`);
    });
    return types.length > 1
      ? typescript_1.factory.createUnionTypeNode(types)
      : types[0];
  }
  getEnumValuesString(values) {
    return values.join('_');
  }
  /*
      Creates a enum "ref" if not used, reuse existing if values and name matches or creates a new one
      with a new name adding a number
    */
  getTrueEnum(schema, propName) {
    var _a;
    const proposedName = schema.title || lodash_1.default.upperFirst(propName);
    const stringEnumValue = this.getEnumValuesString(
      schema.enum ? schema.enum : [],
    );
    const name = this.getEnumUniqueAlias(proposedName, stringEnumValue);
    if (this.enumRefs[proposedName] && proposedName === name) {
      return this.enumRefs[proposedName].type;
    }
    const values = schema.enum ? schema.enum : [];
    const names =
      (_a = schema['x-enumNames']) !== null && _a !== void 0
        ? _a
        : schema['x-enum-varnames'];
    if (names) {
      if (!Array.isArray(names)) {
        throw new Error('enum names must be an array');
      }
      if (names.length !== values.length) {
        throw new Error('enum names must have the same length as enum values');
      }
    }
    const members = values.map((s, index) => {
      if (schema.type === 'number' || schema.type === 'integer') {
        const name = names ? names[index] : String(s);
        return typescript_1.factory.createEnumMember(
          typescript_1.factory.createIdentifier(toIdentifier(name, true)),
          typescript_1.factory.createNumericLiteral(s),
        );
      }
      return typescript_1.factory.createEnumMember(
        typescript_1.factory.createIdentifier(toIdentifier(s, true)),
        typescript_1.factory.createStringLiteral(s),
      );
    });
    this.enumAliases.push(
      typescript_1.factory.createEnumDeclaration(
        [cg.modifier.export],
        name,
        members,
      ),
    );
    const type = typescript_1.factory.createTypeReferenceNode(name, undefined);
    this.enumRefs[proposedName] = {
      values: stringEnumValue,
      type: typescript_1.factory.createTypeReferenceNode(name, undefined),
    };
    return type;
  }
  /**
   * Checks if readOnly/writeOnly properties are present in the given schema.
   * Returns a tuple of booleans; the first one is about readOnly, the second
   * one is about writeOnly.
   */
  checkSchemaOnlyMode(schema, resolveRefs = true) {
    if (this.opts.mergeReadWriteOnly) {
      return { readOnly: false, writeOnly: false };
    }
    const check = (schema, history) => {
      var _a, _b, _c, _d, _e, _f;
      if (isReference(schema)) {
        if (!resolveRefs) return { readOnly: false, writeOnly: false };
        // history is used to prevent infinite recursion
        if (history.has(schema.$ref))
          return { readOnly: false, writeOnly: false };
        // check if the result is cached in `this.refsOnlyMode`
        const cached = this.refsOnlyMode.get(schema.$ref);
        if (cached) return cached;
        history.add(schema.$ref);
        const ret = check(this.resolve(schema), history);
        history.delete(schema.$ref);
        // cache the result
        this.refsOnlyMode.set(schema.$ref, ret);
        return ret;
      }
      let readOnly =
        (_a = schema.readOnly) !== null && _a !== void 0 ? _a : false;
      let writeOnly =
        (_b = schema.writeOnly) !== null && _b !== void 0 ? _b : false;
      const subSchemas = [];
      if ('items' in schema) {
        subSchemas.push(schema.items);
      } else {
        subSchemas.push(
          ...Object.values(
            (_c = schema.properties) !== null && _c !== void 0 ? _c : {},
          ),
        );
        subSchemas.push(
          ...((_d = schema.allOf) !== null && _d !== void 0 ? _d : []),
        );
        subSchemas.push(
          ...((_e = schema.anyOf) !== null && _e !== void 0 ? _e : []),
        );
        subSchemas.push(
          ...((_f = schema.oneOf) !== null && _f !== void 0 ? _f : []),
        );
      }
      for (const schema of subSchemas) {
        // `readOnly` and `writeOnly` do not change once they become true,
        // so you can exit early if both are true.
        if (readOnly && writeOnly) break;
        const result = check(schema, history);
        readOnly = readOnly || result.readOnly;
        writeOnly = writeOnly || result.writeOnly;
      }
      return { readOnly, writeOnly };
    };
    return check(schema, new Set());
  }
  /**
   * Recursively creates a type literal with the given props.
   */
  getTypeFromProperties(props, required, additionalProperties, onlyMode) {
    // Check if any of the props are readOnly or writeOnly schemas
    const propertyNames = Object.keys(props);
    const filteredPropertyNames = propertyNames.filter(name => {
      const schema = props[name];
      const { readOnly, writeOnly } = this.checkSchemaOnlyMode(schema, false);
      switch (onlyMode) {
        case 'readOnly':
          return readOnly || !writeOnly;
        case 'writeOnly':
          return writeOnly || !readOnly;
        default:
          return !readOnly && !writeOnly;
      }
    });
    const members = filteredPropertyNames.map(name => {
      const schema = props[name];
      const isRequired = required && required.includes(name);
      let type = this.getTypeFromSchema(schema, name, onlyMode);
      if (!isRequired && this.opts.unionUndefined) {
        type = typescript_1.factory.createUnionTypeNode([
          type,
          cg.keywordType.undefined,
        ]);
      }
      const signature = cg.createPropertySignature({
        questionToken: !isRequired,
        name,
        type,
      });
      if ('description' in schema && schema.description) {
        typescript_1.default.addSyntheticLeadingComment(
          signature,
          typescript_1.default.SyntaxKind.MultiLineCommentTrivia,
          // Ensures it is formatted like a JSDoc comment: /** description here */
          `* ${schema.description} `,
          true,
        );
      }
      return signature;
    });
    if (additionalProperties) {
      const type =
        additionalProperties === true
          ? cg.keywordType.any
          : this.getTypeFromSchema(additionalProperties, undefined, onlyMode);
      members.push(cg.createIndexSignature(type));
    }
    return typescript_1.factory.createTypeLiteralNode(members);
  }
  getTypeFromResponses(responses, onlyMode) {
    return typescript_1.factory.createUnionTypeNode(
      Object.entries(responses).map(([code, res]) => {
        const statusType =
          code === 'default'
            ? cg.keywordType.number
            : typescript_1.factory.createLiteralTypeNode(
                typescript_1.factory.createNumericLiteral(code),
              );
        const props = [
          cg.createPropertySignature({
            name: 'status',
            type: statusType,
          }),
        ];
        const dataType = this.getTypeFromResponse(res, onlyMode);
        if (dataType !== cg.keywordType.void) {
          props.push(
            cg.createPropertySignature({
              name: 'data',
              type: dataType,
            }),
          );
        }
        return typescript_1.factory.createTypeLiteralNode(props);
      }),
    );
  }
  getTypeFromResponse(resOrRef, onlyMode) {
    const res = this.resolve(resOrRef);
    if (!res || !res.content) return cg.keywordType.void;
    return this.getTypeFromSchema(
      this.getSchemaFromContent(res.content),
      undefined,
      onlyMode,
    );
  }
  getResponseType(responses) {
    // backwards-compatibility
    if (!responses) return 'text';
    const resolvedResponses = Object.values(responses).map(response =>
      this.resolve(response),
    );
    // if no content is specified, assume `text` (backwards-compatibility)
    if (
      !resolvedResponses.some(res => {
        var _a;
        return (
          Object.keys((_a = res.content) !== null && _a !== void 0 ? _a : {})
            .length > 0
        );
      })
    ) {
      return 'text';
    }
    const isJson = resolvedResponses.some(response => {
      var _a;
      const responseMimeTypes = Object.keys(
        (_a = response.content) !== null && _a !== void 0 ? _a : {},
      );
      return responseMimeTypes.some(isJsonMimeType);
    });
    // if there’s `application/json` or `*/*`, assume `json`
    if (isJson) {
      return 'json';
    }
    // if there’s `text/*`, assume `text`
    if (
      resolvedResponses.some(res => {
        var _a;
        return Object.keys(
          (_a = res.content) !== null && _a !== void 0 ? _a : [],
        ).some(type => type.startsWith('text/'));
      })
    ) {
      return 'text';
    }
    // for the rest, assume `blob`
    return 'blob';
  }
  getSchemaFromContent(content) {
    const contentType = Object.keys(content).find(isMimeType);
    if (contentType) {
      const { schema } = content[contentType];
      if (schema) {
        return schema;
      }
    }
    // if no content is specified -> string
    // `text/*` -> string
    if (
      Object.keys(content).length === 0 ||
      Object.keys(content).some(type => type.startsWith('text/'))
    ) {
      return { type: 'string' };
    }
    // rest (e.g. `application/octet-stream`, `application/gzip`, …) -> binary
    return { type: 'string', format: 'binary' };
  }
  getTypeFromParameter(p) {
    if (p.content) {
      const schema = this.getSchemaFromContent(p.content);
      return this.getTypeFromSchema(schema);
    }
    return this.getTypeFromSchema(isReference(p) ? p : p.schema);
  }
  wrapResult(ex) {
    var _a;
    return ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.optimistic)
      ? callOazapftsFunction('ok', [ex])
      : ex;
  }
  /**
   * Does three things:
   * 1. Add a `x-component-ref-path` property.
   * 2. Record discriminating schemas in `this.discriminatingSchemas`. A discriminating schema
   *    refers to a schema that has a `discriminator` property which is neither used in conjunction
   *    with `oneOf` nor `anyOf`.
   * 3. Make all mappings of discriminating schemas explicit to generate types immediately.
   */
  preprocessComponents(schemas) {
    const prefix = '#/components/schemas/';
    // First scan: Add `x-component-ref-path` property and record discriminating schemas
    for (const name of Object.keys(schemas)) {
      const schema = schemas[name];
      if (isReference(schema)) continue;
      schema['x-component-ref-path'] = prefix + name;
      if (schema.discriminator && !schema.oneOf && !schema.anyOf) {
        this.discriminatingSchemas.add(prefix + name);
      }
    }
    const isExplicit = (discriminator, ref) => {
      const refs = Object.values(discriminator.mapping || {});
      return refs.includes(ref);
    };
    // Second scan: Make all mappings of discriminating schemas explicit
    for (const name of Object.keys(schemas)) {
      const schema = schemas[name];
      if (isReference(schema) || !schema.allOf) continue;
      for (const childSchema of schema.allOf) {
        if (
          !isReference(childSchema) ||
          !this.discriminatingSchemas.has(childSchema.$ref)
        ) {
          continue;
        }
        const discriminatingSchema = schemas[getRefBasename(childSchema.$ref)];
        const discriminator = discriminatingSchema.discriminator;
        if (isExplicit(discriminator, prefix + name)) continue;
        if (!discriminator.mapping) {
          discriminator.mapping = {};
        }
        discriminator.mapping[name] = prefix + name;
      }
    }
  }
  generateApi() {
    this.reset();
    // Parse ApiStub.ts so that we don't have to generate everything manually
    const stub = cg.parseFile(
      path_1.default.resolve(__dirname, '../../src/codegen/ApiStub.ts'),
    );
    // ApiStub contains `const servers = {}`, find it ...
    const servers = cg.findFirstVariableDeclaration(stub.statements, 'servers');
    // servers.initializer is readonly, this might break in a future TS version, but works fine for now.
    Object.assign(servers, {
      initializer: (0, generateServers_1.default)(this.spec.servers || []),
    });
    const { initializer } = cg.findFirstVariableDeclaration(
      stub.statements,
      'defaults',
    );
    if (
      !initializer ||
      !typescript_1.default.isObjectLiteralExpression(initializer)
    ) {
      throw new Error('No object literal: defaults');
    }
    cg.changePropertyValue(
      initializer,
      'baseUrl',
      (0, generateServers_1.defaultBaseUrl)(this.spec.servers || []),
    );
    // Collect class functions to be added...
    const functions = [];
    // Keep track of names to detect duplicates
    const names = {};
    Object.keys(this.spec.paths).forEach(path => {
      const item = this.spec.paths[path];
      if (!item) {
        return;
      }
      Object.keys(this.resolve(item)).forEach(verb => {
        const method = verb.toUpperCase();
        // skip summary/description/parameters etc...
        if (!exports.verbs.includes(method)) return;
        const op = item[verb];
        const {
          operationId,
          requestBody,
          responses,
          summary,
          description,
          tags,
        } = op;
        if (this.skip(tags)) {
          return;
        }
        let name = getOperationName(verb, path, operationId);
        const count = (names[name] = (names[name] || 0) + 1);
        if (count > 1) {
          // The name is already taken, which means that the spec is probably
          // invalid as operationIds must be unique. Since this is quite common
          // nevertheless we append a counter:
          name += count;
        }
        // merge item and op parameters
        const resolvedParameters = this.resolveArray(item.parameters);
        for (const p of this.resolveArray(op.parameters)) {
          const existing = resolvedParameters.find(
            r => r.name === p.name && r.in === p.in,
          );
          if (!existing) {
            resolvedParameters.push(p);
          }
        }
        // expand older OpenAPI parameters into deepObject style where needed
        const parameters = this.isConverted
          ? supportDeepObjects(resolvedParameters)
          : resolvedParameters;
        // split into required/optional
        const [required, optional] = lodash_1.default.partition(
          parameters,
          'required',
        );
        // convert parameter names to argument names ...
        const argNames = new Map();
        lodash_1.default.sortBy(parameters, 'name.length').forEach(p => {
          const identifier = toIdentifier(p.name);
          const existing = [...argNames.values()];
          const suffix = existing.includes(identifier)
            ? lodash_1.default.upperFirst(p.in)
            : '';
          argNames.set(p, identifier + suffix);
        });
        const getArgName = param => {
          const name = argNames.get(param);
          if (!name) throw new Error(`Can't find parameter: ${param.name}`);
          return name;
        };
        // build the method signature - first all the required parameters
        const methodParams = required.map(p =>
          cg.createParameter(getArgName(this.resolve(p)), {
            type: this.getTypeFromParameter(p),
          }),
        );
        let body;
        let bodyVar;
        // add body if present
        if (requestBody) {
          body = this.resolve(requestBody);
          const schema = this.getSchemaFromContent(body.content);
          const type = this.getTypeFromSchema(schema, undefined, 'writeOnly');
          bodyVar = toIdentifier(
            type.name || getReferenceName(schema) || 'body',
          );
          methodParams.push(
            cg.createParameter(bodyVar, {
              type,
              questionToken: !body.required,
            }),
          );
        }
        // add an object with all optional parameters
        if (optional.length) {
          methodParams.push(
            cg.createParameter(
              cg.createObjectBinding(
                optional
                  .map(param => this.resolve(param))
                  .map(param => ({ name: getArgName(param) })),
              ),
              {
                initializer:
                  typescript_1.factory.createObjectLiteralExpression(),
                type: typescript_1.factory.createTypeLiteralNode(
                  optional.map(p =>
                    cg.createPropertySignature({
                      name: getArgName(this.resolve(p)),
                      questionToken: true,
                      type: this.getTypeFromParameter(p),
                    }),
                  ),
                ),
              },
            ),
          );
        }
        methodParams.push(
          cg.createParameter('opts', {
            type: typescript_1.factory.createTypeReferenceNode(
              'Oazapfts.RequestOpts',
              undefined,
            ),
            questionToken: true,
          }),
        );
        // Next, build the method body...
        const returnType = this.getResponseType(responses);
        const query = parameters.filter(p => p.in === 'query');
        const header = parameters.filter(p => p.in === 'header');
        let qs;
        if (query.length) {
          const paramsByFormatter = lodash_1.default.groupBy(
            query,
            getFormatter,
          );
          qs = callQsFunction(
            'query',
            Object.entries(paramsByFormatter).map(([format, params]) => {
              //const [allowReserved, encodeReserved] = _.partition(params, "allowReserved");
              return callQsFunction(format, [
                cg.createObjectLiteral(
                  params.map(p => [p.name, getArgName(p)]),
                ),
              ]);
            }),
          );
        }
        const url = createUrlExpression(path, qs);
        const init = [
          typescript_1.factory.createSpreadAssignment(
            typescript_1.factory.createIdentifier('opts'),
          ),
        ];
        if (method !== 'GET') {
          init.push(
            typescript_1.factory.createPropertyAssignment(
              'method',
              typescript_1.factory.createStringLiteral(method),
            ),
          );
        }
        if (bodyVar) {
          init.push(
            cg.createPropertyAssignment(
              'body',
              typescript_1.factory.createIdentifier(bodyVar),
            ),
          );
        }
        if (header.length) {
          init.push(
            typescript_1.factory.createPropertyAssignment(
              'headers',
              typescript_1.factory.createObjectLiteralExpression(
                [
                  typescript_1.factory.createSpreadAssignment(
                    typescript_1.factory.createLogicalAnd(
                      typescript_1.factory.createIdentifier('opts'),
                      typescript_1.factory.createPropertyAccessExpression(
                        typescript_1.factory.createIdentifier('opts'),
                        'headers',
                      ),
                    ),
                  ),
                  ...header.map(param =>
                    cg.createPropertyAssignment(
                      param.name,
                      typescript_1.factory.createIdentifier(getArgName(param)),
                    ),
                  ),
                ],
                true,
              ),
            ),
          );
        }
        const args = [url];
        if (init.length) {
          const formatter = getBodyFormatter(body); // json, form, multipart
          const initObj = typescript_1.factory.createObjectLiteralExpression(
            init,
            true,
          );
          args.push(
            formatter ? callOazapftsFunction(formatter, [initObj]) : initObj,
          );
        }
        functions.push(
          cg.addComment(
            cg.createFunctionDeclaration(
              name,
              {
                modifiers: [cg.modifier.export],
              },
              methodParams,
              cg.block(
                typescript_1.factory.createReturnStatement(
                  this.wrapResult(
                    callOazapftsFunction(
                      {
                        json: 'fetchJson',
                        text: 'fetchText',
                        blob: 'fetchBlob',
                      }[returnType],
                      args,
                      returnType === 'json' || returnType === 'blob'
                        ? [
                            this.getTypeFromResponses(responses, 'readOnly') ||
                              typescript_1.default.SyntaxKind.AnyKeyword,
                          ]
                        : undefined,
                    ),
                  ),
                ),
              ),
            ),
            summary || description,
          ),
        );
      });
    });
    Object.assign(stub, {
      statements: cg.appendNodes(
        stub.statements,
        ...[...this.aliases, ...functions],
        ...this.enumAliases,
      ),
    });
    return stub;
  }
}
exports.default = ApiGenerator;
//# sourceMappingURL=generate.js.map