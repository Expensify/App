import Base64URL from '@src/utils/Base64URL';

describe('Base64URL', () => {
    describe('encode', () => {
        it('should encode a simple string to Base64URL format', () => {
            const result = Base64URL.encode('hello');
            expect(result).toBe('aGVsbG8');
            expect(result).not.toContain('+');
            expect(result).not.toContain('/');
            expect(result).not.toContain('=');
        });

        it('should replace + with - in encoded output', () => {
            // Byte value 251 produces "+" in base64: Buffer.from([251]).toString('base64') = "+w=="
            const result = Base64URL.encode(new Uint8Array([251]));
            expect(result).not.toContain('+');
            expect(result).toContain('-');
            expect(result).toBe('-w');
        });

        it('should replace / with _ in encoded output', () => {
            // Byte value 255 produces "/" in base64: Buffer.from([255]).toString('base64') = "/w=="
            const result = Base64URL.encode(new Uint8Array([255]));
            expect(result).not.toContain('/');
            expect(result).toContain('_');
            expect(result).toBe('_w');
        });

        it('should remove padding characters (=) from encoded output', () => {
            // Strings that would normally have padding in base64
            const result1 = Base64URL.encode('test');
            const result2 = Base64URL.encode('te');
            expect(result1).not.toContain('=');
            expect(result2).not.toContain('=');
        });

        it('should encode empty string', () => {
            const result = Base64URL.encode('');
            expect(result).toBe('');
        });

        it('should encode strings with special characters', () => {
            const testCases = [
                {input: 'Hello World!', expected: 'SGVsbG8gV29ybGQh'},
                {input: 'test@example.com', expected: 'dGVzdEBleGFtcGxlLmNvbQ'},
                {input: '123', expected: 'MTIz'},
            ];

            for (const {input, expected} of testCases) {
                const result = Base64URL.encode(input);
                expect(result).toBe(expected);
                expect(result).not.toContain('+');
                expect(result).not.toContain('/');
                expect(result).not.toContain('=');
            }
        });

        it('should encode ArrayLike<number> input', () => {
            const arrayLike = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
            const result = Base64URL.encode(arrayLike);
            expect(result).toBe('SGVsbG8');
        });

        it('should handle unicode characters', () => {
            const result = Base64URL.encode('Hello 世界');
            expect(result).not.toContain('+');
            expect(result).not.toContain('/');
            expect(result).not.toContain('=');
        });
    });

    describe('decode', () => {
        it('should decode a Base64URL string back to Buffer', () => {
            const encoded = Base64URL.encode('hello');
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe('hello');
        });

        it('should handle Base64URL strings with - characters', () => {
            const encoded = 'SGVsbG8gV29ybGQh'; // "Hello World!" encoded
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe('Hello World!');
        });

        it('should convert - back to + during decoding', () => {
            const original = 'test+';
            const encoded = Base64URL.encode(original);
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe(original);
        });

        it('should convert _ back to / during decoding', () => {
            const original = 'test/';
            const encoded = Base64URL.encode(original);
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe(original);
        });

        it('should restore padding for strings with length % 4 === 2', () => {
            // "te" encodes to "dGU=" which becomes "dGU" in Base64URL
            const encoded = 'dGU';
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe('te');
        });

        it('should restore padding for strings with length % 4 === 3', () => {
            // "test" encodes to "dGVzdA==" which becomes "dGVzdA" in Base64URL
            const encoded = 'dGVzdA';
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe('test');
        });

        it('should handle strings with length % 4 === 0 (no padding needed)', () => {
            const encoded = 'SGVsbG8'; // "Hello" encoded
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe('Hello');
        });

        it('should handle strings with length % 4 === 1', () => {
            // This is technically not valid base64, but we should handle it gracefully
            const encoded = 'SGVsbG8g'; // "Hello " encoded (with space)
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe('Hello ');
        });

        it('should decode an empty string', () => {
            const decoded = Base64URL.decode('');
            expect(decoded.toString()).toBe('');
        });

        it('should handle round-trip encoding and decoding', () => {
            const testCases = ['hello', 'Hello World!', 'test@example.com', '123', 'test+', 'test/', 'Hello 世界', 'a', 'ab', 'abc', 'abcd'];

            for (const original of testCases) {
                const encoded = Base64URL.encode(original);
                const decoded = Base64URL.decode(encoded);
                expect(decoded.toString()).toBe(original);
            }
        });

        it('should handle binary data correctly', () => {
            const binaryData = new Uint8Array([0, 1, 2, 255, 128, 64]);
            const encoded = Base64URL.encode(binaryData);
            const decoded = Base64URL.decode(encoded);
            expect(Array.from(decoded)).toEqual(Array.from(binaryData));
        });

        it('should handle Base64URL strings that already contain padding', () => {
            // Even if padding is present, it should still decode correctly
            const encoded = 'dGVzdA=='; // "test" with padding
            const decoded = Base64URL.decode(encoded);
            expect(decoded.toString()).toBe('test');
        });
    });
});
