import {afterEach, beforeEach, describe, expect, it, jest, mock, test} from 'bun:test';

import type {Stats} from 'fs';

import {Str} from 'expensify-common';
import * as fs from 'fs';
import * as glob from 'glob';
import {API as CompilerAPI, RetainedSourceFile} from 'typescript/async';

import createMock from '../utils/createMock';

const mockReadFileSync = jest.fn<typeof fs.readFileSync>();
const mockLstatSync = jest.fn<typeof fs.lstatSync>();
const mockGlobSync = jest.fn<typeof glob.globSync>();

await mock.module('fs', () => ({...fs, readFileSync: mockReadFileSync, lstatSync: mockLstatSync}));
await mock.module('glob', () => ({...glob, globSync: mockGlobSync}));

// Bun imports the native compiler's ESM client directly, without Jest's CommonJS transform.
const {ComprehensiveStylesFinder} = await import('../../scripts/findUnusedStyles');

// Await compiler I/O before asserting because Bun's promise matchers can stall native RPC callbacks.
describe('findUnusedStyles', () => {
    let finder: InstanceType<typeof ComprehensiveStylesFinder>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLstatSync.mockReturnValue(
            createMock<Stats>({
                isFile: () => true,
            }),
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('releases native source files and closes the compiler after finding styles', async () => {
        // Given a parsed style file, native allocations must not survive the scan.
        const closeCompiler = jest.spyOn(CompilerAPI.prototype, Symbol.asyncDispose);
        const releaseSourceFile = jest.spyOn(RetainedSourceFile.prototype, Symbol.asyncDispose);
        mockGlobSync.mockReturnValueOnce(['src/styles/example.ts']).mockReturnValueOnce([]);
        mockReadFileSync.mockReturnValueOnce('const unusedStyle = {color: "red"};');

        // When the scan finishes, it still reports the unused definition.
        const result = await new ComprehensiveStylesFinder('/test').findUnusedStyles();

        // Then both the source lease and the compiler are disposed.
        expect(result.map((style) => style.key)).toEqual(['unusedStyle']);
        expect(releaseSourceFile).toHaveBeenCalledTimes(1);
        expect(closeCompiler).toHaveBeenCalledTimes(1);
    });

    it('closes the compiler when a source file cannot be read', async () => {
        // Given an unreadable style file, the scan must also release its compiler on the error path.
        const closeCompiler = jest.spyOn(CompilerAPI.prototype, Symbol.asyncDispose);
        mockGlobSync.mockReturnValueOnce(['src/styles/example.ts']).mockReturnValueOnce([]);
        mockReadFileSync.mockImplementationOnce(() => {
            throw new Error('File is unreadable');
        });

        // When file loading fails, the existing warning behavior allows the scan to finish.
        const result = await new ComprehensiveStylesFinder('/test').findUnusedStyles();

        // Then no definitions are reported and the compiler is still disposed.
        expect(result).toEqual([]);
        expect(closeCompiler).toHaveBeenCalledTimes(1);
    });

    describe('Basic Functionality', () => {
        it('should find no unused styles when styles file is empty', async () => {
            // Setup: Empty styles file, no source files
            mockGlobSync.mockReturnValueOnce([]); // No style files (first call in findAllStyleDefinitions)
            mockGlobSync.mockReturnValueOnce([]); // No source files (second call in loadAllFileContents)

            finder = new ComprehensiveStylesFinder('/test');
            const result = await finder.findUnusedStyles();

            expect(result).toEqual([]);
        });

        it('should detect single unused style', async () => {
            // Setup: One style file with one style, no usage
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    unusedStyle: {
                        color: 'red',
                    },
                }) satisfies Styles;
            `);

            mockGlobSync
                .mockReturnValueOnce(['src/styles/index.ts']) // Style files (first call)
                .mockReturnValueOnce(['src/components/Test.tsx']); // Source files (second call)

            mockReadFileSync
                .mockReturnValueOnce(stylesContent) // styles file
                .mockReturnValueOnce('// No style usage here'); // component file

            finder = new ComprehensiveStylesFinder('/test');
            const result = await finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
            expect(result.at(0)?.file).toBe('src/styles/index.ts');
        });

        test('should not report used styles', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    usedStyle: {
                        color: 'blue',
                    },
                }) satisfies Styles;
            `);

            const componentContent = Str.dedent(`
                import styles from '@styles';
                const MyComponent = () => (
                    <View style={styles.usedStyle} />
                );
            `);

            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/components/Test.tsx']);

            mockReadFileSync.mockReturnValueOnce(stylesContent).mockReturnValueOnce(componentContent);

            finder = new ComprehensiveStylesFinder('/test');
            const result = await finder.findUnusedStyles();

            expect(result).toHaveLength(0);
        });
    });

    describe('Complex Usage Patterns', () => {
        it('should detect destructured style usage', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    destructuredStyle: { color: 'green' },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = Str.dedent(`
                import styles from '@styles';
                const { destructuredStyle } = styles;
                const MyComponent = () => <View style={destructuredStyle} />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const result = await finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });

        it('should detect spread pattern usage', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    baseStyle: { padding: 10 },
                    extendedStyle: {
                        ...baseStyle,
                        margin: 5,
                    },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = Str.dedent(`
                import styles from '@styles';
                const MyComponent = () => <View style={styles.extendedStyle} />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const result = await finder.findUnusedStyles();

            // When extendedStyle is used, baseStyle should not be unused since it's spread into extendedStyle
            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });

        it('should detect object spread pattern usage', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    baseStyle: { p10: { padding: 10 } },
                    extendedStyle: {
                        ...baseStyle.p10,
                        margin: 5,
                    },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = Str.dedent(`
                import styles from '@styles';
                const MyComponent = () => <View style={styles.extendedStyle} />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const result = await finder.findUnusedStyles();

            // When extendedStyle is used, baseStyle should not be unused since it's spread into extendedStyle
            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });

        test('should handle dynamic style access', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    dynamicStyle: { color: 'purple' },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = Str.dedent(`
                import styles from '@styles';
                const MyComponent = () => <View style={styles.dynamicStyle} />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const result = await finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });
    });

    describe('Utils/Generators/Themes Integration', () => {
        test('should detect styles used in utils files', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    utilUsedStyle: { fontWeight: 'bold' },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const utilContent = Str.dedent(`
                import styles from '../index';
                export const getBoldText = () => styles.utilUsedStyle;
            `);

            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/styles/utils/text.ts']);

            mockReadFileSync.mockReturnValueOnce(stylesContent).mockReturnValueOnce(utilContent);

            finder = new ComprehensiveStylesFinder('/test');
            const result = await finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });
    });

    describe('Edge Cases', () => {
        test('should ignore styles mentioned in comments', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    commentedStyle: { color: 'orange' },
                }) satisfies Styles;
            `);

            const componentContent = Str.dedent(`
                // This component uses styles.commentedStyle
                /* 
                 * Also mentioning styles.commentedStyle here
                 */
                const MyComponent = () => <View />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const result = await finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('commentedStyle');
        });

        test('should skip helper constants in styles/index.ts', async () => {
            const stylesContent = Str.dedent(`
                const touchCalloutNone = { WebkitTouchCallout: 'none' };
                const lineHeightBadge = { lineHeight: 16 };
                
                const styles = (theme: ThemeColors) => ({
                    realStyle: { 
                        ...touchCalloutNone,
                        color: 'blue' 
                    },
                }) satisfies Styles;
            `);

            const componentContent = Str.dedent(`
                import styles from '@styles';
                const MyComponent = () => <View style={styles.realStyle} />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const result = await finder.findUnusedStyles();

            // Should not include touchCalloutNone or lineHeightBadge
            expect(result).toHaveLength(0);
        });

        test('should handle malformed TypeScript files gracefully', async () => {
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    validStyle: { color: 'blue' },
                }) satisfies Styles;
            `);

            const malformedContent = Str.dedent(`
                import styles from '@styles';
                const MyComponent = () => {
                    // Syntax error - missing closing brace
                    return <View style={styles.validStyle}
            `);

            setupMockFiles(stylesContent, malformedContent);

            // A parse error must not hide style usages in the recovered syntax tree.
            const result = await finder.findUnusedStyles();
            expect(result).toHaveLength(0);
        });
    });

    describe('Error Handling', () => {
        test('should handle file read errors gracefully', async () => {
            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/components/Test.tsx']);

            mockReadFileSync
                .mockImplementationOnce(() => {
                    throw new Error('File not found');
                })
                .mockReturnValueOnce('const MyComponent = () => <View />;');

            finder = new ComprehensiveStylesFinder('/test');

            const result = await finder.findUnusedStyles();
            expect(result).toEqual([]);
        });

        test('should handle directory instead of file', async () => {
            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/components/Test.tsx']);

            mockReadFileSync.mockReturnValueOnce('const styles = () => ({});');

            // Mock lstatSync to indicate it's a directory, not a file
            mockLstatSync.mockReturnValueOnce(
                createMock<Stats>({
                    isFile: () => false,
                }),
            );

            finder = new ComprehensiveStylesFinder('/test');

            const result = await finder.findUnusedStyles();
            expect(result).toEqual([]);
        });
    });

    describe('Performance Tests', () => {
        test('should handle large number of styles efficiently', async () => {
            const manyStyles = Array.from({length: 1000}, (_, i) => `style${i}: { color: 'color${i}' },`).join('\n');

            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    ${manyStyles}
                }) satisfies Styles;
            `);

            // Use only the first style
            const componentContent = Str.dedent(`
                import styles from '@styles';
                const MyComponent = () => <View style={styles.style0} />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const start = Date.now();
            const result = await finder.findUnusedStyles();
            const end = Date.now();

            expect(result).toHaveLength(999); // All except style0
            expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });

    // Helper function to setup common mock scenarios
    function setupMockFiles(stylesContent: string, componentContent: string) {
        // First call: finding style files
        mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']);
        // Second call: finding all source files
        mockGlobSync.mockReturnValueOnce(['src/components/Test.tsx']);

        // File reads: first for style file, then for component file
        mockReadFileSync.mockReturnValueOnce(stylesContent).mockReturnValueOnce(componentContent);

        finder = new ComprehensiveStylesFinder('/test');
    }
});
