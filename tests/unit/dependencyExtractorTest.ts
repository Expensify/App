import {extract} from '../../jest/dependencyExtractor';

const rewrite = (code: string) => extract(code, '', (rewrittenCode) => rewrittenCode);

describe('dependencyExtractor', () => {
    it.each([
        ['a type with nested generics and a call', "jest.requireActual<Record<string, typeof import('rn')>>('rn')", "jest.requireActual('rn')"],
        ['a type over several lines', "require<{\n    default: typeof P;\n}>('@components/P')", "require('@components/P')"],
        ['a path on the next line', "require<typeof X>(\n    '@libs/X',\n)", "require(\n    '@libs/X',\n)"],
        ['jest.requireMock', "jest.requireMock<typeof X>('@libs/X')", "jest.requireMock('@libs/X')"],
    ])('strips the type argument from %s', (_, code, expected) => {
        // Given a typed call Jest's default extractor can't read, because `(` doesn't follow the name
        // When the extractor rewrites it
        // Then only the type argument is gone, so Jest links the path
        expect(rewrite(code)).toBe(expected);
    });

    it('leaves a comparison followed by a generic call unchanged', () => {
        // Given a `<` that isn't part of a typed require, followed later by a generic call
        const code = "if (a < b) { useState<string>('x'); }";

        // When the extractor rewrites it
        // Then nothing changes, so a stray `<` can't swallow code up to the next call
        expect(rewrite(code)).toBe(code);
    });
});
