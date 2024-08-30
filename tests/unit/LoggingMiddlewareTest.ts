import {serializeLoggingData} from '@libs/Middleware/Logging';

describe('LoggingMiddleware', () => {
    describe('getCircularReplacer', () => {
        it('should return "[Circular]" for circular references', () => {
            const obj: Record<string, unknown> = {};
            obj.obj = obj;
            const result = serializeLoggingData(obj);
            expect(result).toEqual({obj: '[Circular]'});
        });

        it('should return the original value for non-circular references', () => {
            const obj: Record<string, unknown> = {};
            obj.foo = 'bar';
            const result = serializeLoggingData(obj);
            expect(result).toEqual({foo: 'bar'});
        });

        it('should not stringify function in the object', () => {
            const obj: Record<string, unknown> = {
                foo: () => 'bar',
                baz: 'baz',
            };
            const result = serializeLoggingData(obj);
            expect(result).toEqual({baz: 'baz'});
        });
    });
});
