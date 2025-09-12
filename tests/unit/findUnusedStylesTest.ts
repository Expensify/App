import type {Stats} from 'fs';
import * as fs from 'fs';
import {globSync} from 'glob';
import {ComprehensiveStylesFinder} from '../../scripts/findUnusedStyles';
import dedent from '../../src/libs/StringUtils/dedent';

jest.mock(
    'fs',
    () =>
        ({
            ...jest.requireActual('fs'),
            readFileSync: jest.fn(),
            lstatSync: jest.fn(),
        }) as typeof fs,
);

jest.mock(
    'glob',
    () =>
        ({
            ...jest.requireActual('glob'),
            globSync: jest.fn(),
        }) as unknown as typeof globSync,
);

const mockReadFileSync = jest.mocked(fs.readFileSync);
const mockLstatSync = jest.mocked(fs.lstatSync);
const mockGlobSync = jest.mocked(globSync);

describe('findUnusedStyles', () => {
    let finder: ComprehensiveStylesFinder;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLstatSync.mockReturnValue({
            isFile: () => true,
        } as Stats);
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
            const stylesContent = dedent(`
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
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    usedStyle: {
                        color: 'blue',
                    },
                }) satisfies Styles;
            `);

            const componentContent = dedent(`
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
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    destructuredStyle: { color: 'green' },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = dedent(`
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
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    baseStyle: { padding: 10 },
                    extendedStyle: {
                        ...baseStyle,
                        margin: 5,
                    },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = dedent(`
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
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    baseStyle: { p10: { padding: 10 } },
                    extendedStyle: {
                        ...baseStyle.p10,
                        margin: 5,
                    },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = dedent(`
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
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    dynamicStyle: { color: 'purple' },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const componentContent = dedent(`
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
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    utilUsedStyle: { fontWeight: 'bold' },
                    unusedStyle: { color: 'red' },
                }) satisfies Styles;
            `);

            const utilContent = dedent(`
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
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    commentedStyle: { color: 'orange' },
                }) satisfies Styles;
            `);

            const componentContent = dedent(`
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
            const stylesContent = dedent(`
                const touchCalloutNone = { WebkitTouchCallout: 'none' };
                const lineHeightBadge = { lineHeight: 16 };
                
                const styles = (theme: ThemeColors) => ({
                    realStyle: { 
                        ...touchCalloutNone,
                        color: 'blue' 
                    },
                }) satisfies Styles;
            `);

            const componentContent = dedent(`
                import styles from '@styles';
                const MyComponent = () => <View style={styles.realStyle} />;
            `);

            setupMockFiles(stylesContent, componentContent);

            const result = finder.findUnusedStyles();

            // Should not include touchCalloutNone or lineHeightBadge
            expect(result).toHaveLength(0);
        });

        test('should handle malformed TypeScript files gracefully', () => {
            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    validStyle: { color: 'blue' },
                }) satisfies Styles;
            `);

            const malformedContent = dedent(`
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
            mockLstatSync.mockReturnValueOnce({
                isFile: () => false,
            } as Stats);

            finder = new ComprehensiveStylesFinder('/test');

            expect(() => finder.findUnusedStyles()).not.toThrow();
        });
    });

    describe('Performance Tests', () => {
        test('should handle large number of styles efficiently', () => {
            const manyStyles = Array.from({length: 1000}, (_, i) => `style${i}: { color: 'color${i}' },`).join('\n');

            const stylesContent = dedent(`
                const styles = (theme: ThemeColors) => ({
                    ${manyStyles}
                }) satisfies Styles;
            `);

            // Use only the first style
            const componentContent = dedent(`
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
