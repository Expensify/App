import type {Stats} from 'fs';
import type * as GlobModule from 'glob';

import {Str} from 'expensify-common';
import * as fs from 'fs';
import {globSync} from 'glob';

import {ComprehensiveStylesFinder} from '../../scripts/findUnusedStyles';
import createMock from '../utils/createMock';

jest.mock('fs', () => ({
    ...jest.requireActual<typeof fs>('fs'),
    readFileSync: jest.fn(),
    lstatSync: jest.fn(),
}));

jest.mock('glob', () => ({
    ...jest.requireActual<typeof GlobModule>('glob'),
    globSync: jest.fn(),
}));

const mockReadFileSync = jest.mocked(fs.readFileSync);
const mockLstatSync = jest.mocked(fs.lstatSync);
const mockGlobSync = jest.mocked(globSync);

describe('findUnusedStyles', () => {
    let finder: ComprehensiveStylesFinder;

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

    describe('Basic Functionality', () => {
        it('should find no unused styles when styles file is empty', () => {
            // Setup: Empty styles file, no source files
            mockGlobSync.mockReturnValueOnce([]); // No style files (first call in findAllStyleDefinitions)
            mockGlobSync.mockReturnValueOnce([]); // No source files (second call in loadAllFileContents)

            finder = new ComprehensiveStylesFinder('/test');
            const result = finder.findUnusedStyles();

            expect(result).toEqual([]);
        });

        it('should detect single unused style', () => {
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
            const result = finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
            expect(result.at(0)?.file).toBe('src/styles/index.ts');
        });

        test('should not report used styles', () => {
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
            const result = finder.findUnusedStyles();

            expect(result).toHaveLength(0);
        });
    });

    describe('Complex Usage Patterns', () => {
        it('should detect destructured style usage', () => {
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

            const result = finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });

        it('should detect spread pattern usage', () => {
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

            const result = finder.findUnusedStyles();

            // When extendedStyle is used, baseStyle should not be unused since it's spread into extendedStyle
            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });

        it('should detect object spread pattern usage', () => {
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

            const result = finder.findUnusedStyles();

            // When extendedStyle is used, baseStyle should not be unused since it's spread into extendedStyle
            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });

        test('should handle dynamic style access', () => {
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

            const result = finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });
    });

    describe('Utils/Generators/Themes Integration', () => {
        test('should detect styles used in utils files', () => {
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
            const result = finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('unusedStyle');
        });
    });

    describe('Edge Cases', () => {
        test('should ignore styles mentioned in comments', () => {
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

            const result = finder.findUnusedStyles();

            expect(result).toHaveLength(1);
            expect(result.at(0)?.key).toBe('commentedStyle');
        });

        test('should skip helper constants in styles/index.ts', () => {
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

            const result = finder.findUnusedStyles();

            // Should not include touchCalloutNone or lineHeightBadge
            expect(result).toHaveLength(0);
        });

        test('should handle malformed TypeScript files gracefully', () => {
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

            // Should not throw an error
            expect(() => {
                const result = finder.findUnusedStyles();
                expect(result).toHaveLength(0); // Style is used despite syntax error
            }).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        test('should handle file read errors gracefully', () => {
            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/components/Test.tsx']);

            mockReadFileSync
                .mockImplementationOnce(() => {
                    throw new Error('File not found');
                })
                .mockReturnValueOnce('const MyComponent = () => <View />;');

            finder = new ComprehensiveStylesFinder('/test');

            expect(() => finder.findUnusedStyles()).not.toThrow();
        });

        test('should handle directory instead of file', () => {
            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/components/Test.tsx']);

            mockReadFileSync.mockReturnValueOnce('const styles = () => ({});');

            // Mock lstatSync to indicate it's a directory, not a file
            mockLstatSync.mockReturnValueOnce(
                createMock<Stats>({
                    isFile: () => false,
                }),
            );

            finder = new ComprehensiveStylesFinder('/test');

            expect(() => finder.findUnusedStyles()).not.toThrow();
        });
    });

    describe('Performance Tests', () => {
        test('should handle large number of styles efficiently', () => {
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
            const result = finder.findUnusedStyles();
            const end = Date.now();

            expect(result).toHaveLength(999); // All except style0
            expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });

    describe('Index style functions', () => {
        it.each([
            ['an object with satisfies', 'const plainStyles = () => ({entryStyle: {width: 1} satisfies ViewStyle}) satisfies Styles;'],
            ['a helper call', 'const plainStyles = (theme: ThemeColors) => ({entryStyle: someHelper(theme)}) satisfies Styles;'],
            ['a shorthand property', 'const staticStyles = () => ({entryStyle}) satisfies Styles;'],
            ['a Platform.select call', 'const staticStyles = () => ({entryStyle: Platform.select({web: {width: 1}, default: {}})}) satisfies Styles;'],
            ['an as const body', 'const staticStyles = () => ({entryStyle: {width: 1}}) as const;'],
            ['a block body with a return', 'const staticStyles = () => { const local = 1; return {entryStyle: {width: local}}; };'],
        ])('should report an unused style written as %s', (_name, stylesContent) => {
            // Given a style that is written in a shape other than a plain object literal or a method, and that nothing uses
            setupMockFiles(stylesContent, '// No style usage here');

            // When the finder looks for unused styles
            const result = finder.findUnusedStyles();

            // Then it is reported, because only plain object literals and methods used to be recorded, so an unused style written any other way was never caught
            expect(result.map((style) => style.key)).toEqual(['entryStyle']);
        });

        it('should unwrap StyleSheet.create with satisfies', () => {
            // Given the staticStyles shape of src/styles/index.ts, where the object is the argument of StyleSheet.create followed by satisfies
            const stylesContent = Str.dedent(`
                const staticStyles = (theme: ThemeColors) =>
                    StyleSheet.create({
                        wrappedStyle: {
                            color: 'red',
                        },
                    }) satisfies StaticStyles;
            `);
            setupMockFiles(stylesContent, '// No style usage here');

            // When the finder looks for unused styles
            const result = finder.findUnusedStyles();

            // Then the wrapped key is still found, otherwise the check would read 0 definitions from index.ts and stay green while blind
            expect(result.map((style) => style.key)).toEqual(['wrappedStyle']);
        });

        it('should track arrow function entries as definitions', () => {
            // Given a dynamicStyles function whose entries are arrow functions, one of which is used
            const stylesContent = Str.dedent(`
                const dynamicStyles = (theme: ThemeColors) => ({
                    unusedDynamicStyle: (isSmall: boolean) => ({width: isSmall ? 1 : 2}),
                    usedDynamicStyle: (isSmall: boolean) => ({width: isSmall ? 3 : 4}),
                });
            `);
            setupMockFiles(stylesContent, 'styles.usedDynamicStyle(true);');

            // When the finder looks for unused styles
            const result = finder.findUnusedStyles();

            // Then only the unused one is reported, so dead dynamic styles do not pile up unnoticed while used ones are not flagged
            expect(result.map((style) => style.key)).toEqual(['unusedDynamicStyle']);
        });

        it('should never record allowlisted keys', () => {
            // Given an allowlisted design scale key next to a regular key, both without usages
            const stylesContent = Str.dedent(`
                const staticStyles = () => ({
                    finePrintStrong: {fontSize: 9},
                    siblingStyle: {fontSize: 10},
                });
            `);
            setupMockFiles(stylesContent, '// No style usage here');

            // When the finder looks for unused styles
            const result = finder.findUnusedStyles();

            // Then only the regular key is reported, so the intentionally kept design scale key does not fail CI
            expect(result.map((style) => style.key)).toEqual(['siblingStyle']);
        });

        it('should count a string literal as a usage only in the dynamic style key files', () => {
            // Given a style whose key is only chosen as a string literal, the way the avatar sizing files do for styles[styleKey]
            const stylesContent = Str.dedent(`
                const styles = (theme: ThemeColors) => ({
                    singleAvatarXSmall: {
                        width: 24,
                    },
                }) satisfies Styles;
            `);
            const sizingContent = `const key: 'singleAvatarXSmall' = 'singleAvatarXSmall';`;

            // When the literal sits in a regular source file, and when the same literal sits in one of the sizing files
            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/components/Test.tsx']);
            mockReadFileSync.mockReturnValueOnce(stylesContent).mockReturnValueOnce(sizingContent);
            const resultInRegularFile = new ComprehensiveStylesFinder('/test').findUnusedStyles();

            mockGlobSync.mockReturnValueOnce(['src/styles/index.ts']).mockReturnValueOnce(['src/components/Avatar/layouts/getDiagonalAvatarSizing.ts']);
            mockReadFileSync.mockReturnValueOnce(stylesContent).mockReturnValueOnce(sizingContent);
            const resultInSizingFile = new ComprehensiveStylesFinder('/test').findUnusedStyles();

            // Then the literal only counts there, so a dead key cannot hide behind an unrelated string elsewhere
            expect(resultInRegularFile.map((style) => style.key)).toEqual(['singleAvatarXSmall']);
            expect(resultInSizingFile).toEqual([]);
        });
    });

    describe('Index structure guard', () => {
        const createEntries = (count: number) => Array.from({length: count}, (_, index) => `entry${index}: {width: ${index}},`).join('\n');

        it('should name the style function that yields no definitions', () => {
            // Given an index file where dynamicStyles no longer exists under that name, e.g. after a rename
            const stylesContent = `
                const staticStyles = () => ({${createEntries(600)}});
                const renamedDynamicStyles = () => ({entry: {width: 1}});
                const plainStyles = () => ({plainEntry: {width: 1}});
            `;
            setupMockFiles(stylesContent, '// No style usage here');

            // When the structure is checked after the scan
            finder.findUnusedStyles();

            // Then the problem names dynamicStyles, so losing one function cannot hide behind the total of the others
            expect(finder.getIndexStructureProblem()).toContain('dynamicStyles');
        });

        it('should report a total below the floor', () => {
            // Given an index file where all three functions are read but yield only a few definitions
            const stylesContent = `
                const staticStyles = () => ({a: {width: 1}});
                const dynamicStyles = () => ({b: () => ({width: 1})});
                const plainStyles = () => ({c: {width: 1}});
            `;
            setupMockFiles(stylesContent, '// No style usage here');

            // When the structure is checked after the scan
            finder.findUnusedStyles();

            // Then the problem reports the low total, so a refactor that silently drops most of the file fails loudly
            expect(finder.getIndexStructureProblem()).toContain('Read only 3 style definitions');
        });

        it('should report no problem for a healthy index file', () => {
            // Given an index file where every function yields definitions and the total reaches the floor
            const stylesContent = `
                const staticStyles = () => ({${createEntries(500)}});
                const dynamicStyles = () => ({b: () => ({width: 1})});
                const plainStyles = () => ({c: {width: 1}});
            `;
            setupMockFiles(stylesContent, '// No style usage here');

            // When the structure is checked after the scan
            finder.findUnusedStyles();

            // Then there is no problem, so the guard does not fail a correctly read file
            expect(finder.getIndexStructureProblem()).toBeUndefined();
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
