import {getCircularReplacer} from '@libs/Middleware/Logging';

describe('LoggingMiddleware', () => {
    describe('getCircularReplacer', () => {
        it('should return "[Circular]" for circular references', () => {
            const circularReplacer = getCircularReplacer();
            const obj: Record<string, unknown> = {};
            obj.obj = obj;
            const result = JSON.stringify(obj, circularReplacer);
            expect(result).toBe('{"obj":"[Circular]"}');
        });

        it('should return the original value for non-circular references', () => {
            const circularReplacer = getCircularReplacer();
            const obj: Record<string, unknown> = {};
            obj.foo = 'bar';
            const result = JSON.stringify(obj, circularReplacer);
            expect(result).toBe('{"foo":"bar"}');
        });

        it('should not stringify function in the object', () => {
            const circularReplacer = getCircularReplacer();
            const obj: Record<string, unknown> = {
                foo: () => 'bar',
                baz: 'baz',
            };
            const result = JSON.stringify(obj, circularReplacer);
            expect(result).toBe('{"baz":"baz"}');
        });
    });
});
