'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const generate_1 = require('./generate');
describe('getOperationName', () => {
  it('should use the id', () => {
    expect(
      (0, generate_1.getOperationName)('GET', '/pets', 'list pets'),
    ).toEqual('listPets');
  });
  it('should use the verb and path', () => {
    expect(
      (0, generate_1.getOperationName)('GET', '/pets/{color}/{status}'),
    ).toEqual('getPetsByColorAndStatus');
  });
  it('should not use ids with special chars', () => {
    expect(
      (0, generate_1.getOperationName)(
        'GET',
        '/pets',
        'API\\PetController::listPetAction',
      ),
    ).toEqual('getPets');
  });
});
describe('content types', () => {
  it('should identify strings that look like mime types', () => {
    expect((0, generate_1.isMimeType)('*/*')).toBe(true);
    expect((0, generate_1.isMimeType)('foo/bar')).toBe(true);
    expect((0, generate_1.isMimeType)('foo/bar+baz')).toBe(true);
    expect((0, generate_1.isMimeType)(undefined)).toBe(false);
    expect((0, generate_1.isMimeType)('')).toBe(false);
    expect((0, generate_1.isMimeType)('foo')).toBe(false);
    expect((0, generate_1.isMimeType)('foo/bar/boo')).toBe(false);
  });
  it('should treat some content types as json', () => {
    expect((0, generate_1.isJsonMimeType)('application/json')).toBe(true);
    expect((0, generate_1.isJsonMimeType)('application/json+foo')).toBe(true);
    expect((0, generate_1.isJsonMimeType)('*/*')).toBe(true);
    expect((0, generate_1.isJsonMimeType)('text/plain')).toBe(false);
  });
});
//# sourceMappingURL=generate.test.js.map