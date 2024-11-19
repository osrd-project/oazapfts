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
exports.defaultBaseUrl = void 0;
const lodash_1 = __importDefault(require('lodash'));
const cg = __importStar(require('./tscodegen'));
const typescript_1 = require('typescript');
function createTemplate(url) {
  const tokens = url.split(/{([\s\S]+?)}/g);
  const chunks = lodash_1.default.chunk(tokens.slice(1), 2);
  return cg.createTemplateString(
    tokens[0],
    chunks.map(([expression, literal]) => ({
      expression: typescript_1.factory.createIdentifier(expression),
      literal,
    })),
  );
}
function createServerFunction(template, vars) {
  const params = [
    cg.createParameter(
      cg.createObjectBinding(
        Object.entries(vars || {}).map(([name, value]) => {
          return {
            name,
            initializer: cg.createLiteral(value.default),
          };
        }),
      ),
      {
        type: typescript_1.factory.createTypeLiteralNode(
          Object.entries(vars || {}).map(([name, value]) => {
            return cg.createPropertySignature({
              name,
              type: value.enum
                ? cg.createEnumTypeNode(value.enum)
                : typescript_1.factory.createUnionTypeNode([
                    cg.keywordType.string,
                    cg.keywordType.number,
                    cg.keywordType.boolean,
                  ]),
            });
          }),
        ),
      },
    ),
  ];
  return cg.createArrowFunction(params, createTemplate(template));
}
function generateServerExpression(server) {
  return server.variables
    ? createServerFunction(server.url, server.variables)
    : typescript_1.factory.createStringLiteral(server.url);
}
function defaultUrl(server) {
  if (!server) return '/';
  const { url, variables } = server;
  if (!variables) return url;
  return url.replace(/\{(.+?)\}/g, (m, name) =>
    variables[name] ? String(variables[name].default) : m,
  );
}
function defaultBaseUrl(servers) {
  return typescript_1.factory.createStringLiteral(defaultUrl(servers[0]));
}
exports.defaultBaseUrl = defaultBaseUrl;
function serverName(server, index) {
  return server.description
    ? lodash_1.default.camelCase(server.description.replace(/\W+/, ' '))
    : `server${index + 1}`;
}
function generateServers(servers) {
  return cg.createObjectLiteral(
    servers.map((server, i) => [
      serverName(server, i),
      generateServerExpression(server),
    ]),
  );
}
exports.default = generateServers;
//# sourceMappingURL=generateServers.js.map