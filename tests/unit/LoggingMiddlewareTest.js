"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging_1 = require("@libs/Middleware/Logging");
describe('LoggingMiddleware', function () {
    describe('getCircularReplacer', function () {
        it('should return "[Circular]" for circular references', function () {
            var obj = {};
            obj.obj = obj;
            var result = (0, Logging_1.serializeLoggingData)(obj);
            expect(result).toEqual({ obj: '[Circular]' });
        });
        it('should return the original value for non-circular references', function () {
            var obj = {};
            obj.foo = 'bar';
            var result = (0, Logging_1.serializeLoggingData)(obj);
            expect(result).toEqual({ foo: 'bar' });
        });
        it('should not stringify function in the object', function () {
            var obj = {
                foo: function () { return 'bar'; },
                baz: 'baz',
            };
            var result = (0, Logging_1.serializeLoggingData)(obj);
            expect(result).toEqual({ baz: 'baz' });
        });
    });
});
