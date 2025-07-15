import * as fs from 'fs';
import {globSync} from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

type StyleDefinition = {
    key: string;
    file: string;
    line: number;
    column: number;
};

// Static patterns and constants - created once
const STYLE_FILE_EXTENSIONS = '**/*.{ts,tsx,js,jsx}';
const VALID_IDENTIFIER_PATTERN = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const SPREAD_PROPERTY_PATTERN = /\.\.\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
const SIMPLE_SPREAD_PATTERN = /\.\.\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\s*\.)/g;
const STYLE_KEY_SKIP_PATTERNS = ['default', 'exports', 'module', 'require', 'import', 'from', 'theme', 'colors', 'variables', 'CONST', 'Platform', 'StyleSheet'];

class ComprehensiveStylesFinder {
    private rootDir: string;

    private styleDefinitions = new Map<string, StyleDefinition>();

    private fileContents = new Map<string, string>();

    constructor(rootDir: string) {
        this.rootDir = rootDir;
    }

    findUnusedStyles(): StyleDefinition[] {
        console.log('🔍 Step 1: Finding all style definitions...');
        this.findAllStyleDefinitions();
        console.log(`📊 Found ${this.styleDefinitions.size} style definitions`);

        console.log('🔍 Step 2: Loading all file contents...');
        this.loadAllFileContents();

        console.log('🔍 Step 3: Comprehensive style usage analysis...');
        this.findStyleUsagesComprehensive();

        console.log('📊 Step 4: Identifying unused styles...');
        return this.getUnusedStyles();
    }

    private findAllStyleDefinitions(): void {
        const styleFilesPaths = `src/styles/${STYLE_FILE_EXTENSIONS}`;

        // Use ignore parameter to exclude directories more cleanly
        const ignorePatterns = ['src/styles/utils/**', 'src/styles/generators/**', 'src/styles/theme/**'];

        const styleFiles = globSync(styleFilesPaths, {
            cwd: this.rootDir,
            ignore: ignorePatterns,
        });

        console.log(`Scanning ${styleFiles.length} main style files (excluding utils/generators/themes)...`);

        for (const file of styleFiles) {
            const fullPath = path.join(this.rootDir, file);
            try {
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const sourceFile = ts.createSourceFile(fullPath, fileContent, ts.ScriptTarget.Latest, true);
                this.extractStyleKeysFromFile(sourceFile, file);
            } catch (error) {
                console.warn(`Warning: Could not read style file ${file}:`, error);
            }
        }
    }

    private extractStyleKeysFromFile(sourceFile: ts.SourceFile, file: string): void {
        const visit = (node: ts.Node) => {
            // For styles/index.ts, only process styles that are inside the main styles function
            if (file === 'src/styles/index.ts') {
                // Look for the main styles function (arrow function assigned to 'styles' variable)
                if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'styles' && node.initializer && ts.isArrowFunction(node.initializer)) {
                    // Process only the body of the styles function
                    if (node.initializer.body) {
                        let returnObject: ts.Expression | undefined;

                        if (ts.isParenthesizedExpression(node.initializer.body)) {
                            returnObject = node.initializer.body.expression;
                        } else if (ts.isObjectLiteralExpression(node.initializer.body)) {
                            returnObject = node.initializer.body;
                        } else if (ts.isSatisfiesExpression(node.initializer.body)) {
                            const satisfiesExpr = node.initializer.body.expression;

                            if (ts.isParenthesizedExpression(satisfiesExpr)) {
                                returnObject = satisfiesExpr.expression;
                            } else {
                                returnObject = satisfiesExpr;
                            }
                        }

                        if (returnObject && ts.isObjectLiteralExpression(returnObject)) {
                            // Process each property in the returned object
                            this.processObjectProperties(returnObject, sourceFile, file);

                            // After processing style definitions, check for spread patterns within this styles file
                            const fileContent = sourceFile.getFullText();
                            this.checkSpreadPatternsInStylesFile(fileContent);
                        }
                    }
                    return; // Don't continue traversing for styles function
                }

                // Skip processing top-level constants and other functions for styles/index.ts
                if (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) {
                    return;
                }
            } else {
                // For other files, process all style-like nodes normally
                this.processStyleNode(node, sourceFile, file);
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
    }

    private processObjectProperties(objectLiteral: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile, file: string): void {
        for (const property of objectLiteral.properties) {
            if (ts.isPropertyAssignment(property) || ts.isMethodDeclaration(property)) {
                const key = this.extractKeyFromPropertyNode(property);

                if (key && this.isStyleKey(key)) {
                    try {
                        let shouldCapture = false;
                        if (ts.isPropertyAssignment(property)) {
                            // For PropertyAssignment, check if the value is an object literal
                            if (ts.isObjectLiteralExpression(property.initializer)) {
                                shouldCapture = true;
                            }
                        } else if (ts.isMethodDeclaration(property)) {
                            // For MethodDeclaration, it's a function that returns styles
                            shouldCapture = true;
                        }

                        if (shouldCapture) {
                            const {line, character} = sourceFile.getLineAndCharacterOfPosition(property.getStart());
                            this.styleDefinitions.set(key, {
                                key,
                                file,
                                line: line + 1,
                                column: character + 1,
                            });
                        }
                    } catch (error) {
                        console.warn(`Warning: Could not get position for style '${key}' in ${file}`);
                    }
                }
            }
        }
    }

    private extractKeyFromPropertyNode(node: ts.PropertyAssignment | ts.MethodDeclaration): string | undefined {
        if (ts.isPropertyAssignment(node)) {
            if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
                return node.name.text;
            }
        } else if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
            return node.name.text;
        }
        return undefined;
    }

    private processStyleNode(node: ts.Node, sourceFile: ts.SourceFile, file: string): void {
        // Look for object literal properties (style definitions)
        if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
            const key = this.extractKeyFromPropertyNode(node);

            if (key && this.isStyleKey(key)) {
                try {
                    let shouldCapture = false;
                    if (ts.isPropertyAssignment(node)) {
                        // For PropertyAssignment, check if the value is an object literal
                        if (ts.isObjectLiteralExpression(node.initializer)) {
                            shouldCapture = true;
                        }
                    } else if (ts.isMethodDeclaration(node)) {
                        // For MethodDeclaration, it's a function that returns styles
                        shouldCapture = true;
                    }

                    if (shouldCapture) {
                        const {line, character} = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                        this.styleDefinitions.set(key, {
                            key,
                            file,
                            line: line + 1,
                            column: character + 1,
                        });
                    }
                } catch (error) {
                    console.warn(`Warning: Could not get position for style '${key}' in ${file}`);
                }
            }
        }

        // Also look for variable declarations that might be styles
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
            const key = node.name.text;
            if (this.isStyleKey(key)) {
                try {
                    const {line, character} = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                    this.styleDefinitions.set(key, {
                        key,
                        file,
                        line: line + 1,
                        column: character + 1,
                    });
                } catch (error) {
                    console.warn(`Warning: Could not get position for style '${key}' in ${file}`);
                }
            }
        }
    }

    private isStyleKey(key: string): boolean {
        // Skip certain patterns that are likely not style keys
        if (STYLE_KEY_SKIP_PATTERNS.includes(key)) {
            return false;
        }

        // Must be a valid identifier
        if (!VALID_IDENTIFIER_PATTERN.test(key)) {
            return false;
        }

        return true;
    }

    private loadAllFileContents(): void {
        // Load all source files EXCEPT the main style definition files
        const allFilesPaths = `src/**/${STYLE_FILE_EXTENSIONS}`;

        // Use ignore parameter to exclude only the main style definition files
        // Keep utils/generators/themes for usage checking
        const ignorePatterns = ['src/styles/index.ts', 'src/styles/variables.ts'];

        const sourceFiles = globSync(allFilesPaths, {
            cwd: this.rootDir,
            ignore: ignorePatterns,
        });

        console.log(`Loading ${sourceFiles.length} source files (including utils/generators/themes for usage checking)...`);

        for (const file of sourceFiles) {
            const fullPath = path.join(this.rootDir, file);
            try {
                // Check if it's actually a file (not a directory)
                const stat = fs.lstatSync(fullPath);
                if (!stat.isFile()) {
                    console.warn(`Skipping ${file}: not a file`);
                    continue;
                }

                const fileContent = fs.readFileSync(fullPath, 'utf8');
                this.fileContents.set(file, fileContent);
            } catch (error) {
                console.warn(`Warning: Could not read source file ${file}:`, error);
            }
        }
    }

    private findStyleUsagesComprehensive(): void {
        const allFiles = Array.from(this.fileContents.entries());
        console.log(`Analyzing usage patterns for ${this.styleDefinitions.size} style keys across ${allFiles.length} files...`);

        let processedFiles = 0;
        for (const [file, content] of allFiles) {
            this.analyzeFileForStyleUsage(file, content);
            processedFiles++;

            // Early termination: if all styles are found, stop processing
            if (this.styleDefinitions.size === 0) {
                console.log(`  ✅ All styles found as used!`);
                break;
            }

            // Show progress every 100 files
            if (processedFiles % 100 === 0) {
                console.log(`  ${this.styleDefinitions.size} styles remaining...`);
            }
        }

        console.log(`  Completed analysis.`);
    }

    private analyzeFileForStyleUsage(file: string, content: string): void {
        // Use TypeScript AST to get content without comments
        try {
            const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

            // Use getText() to get content without comments
            const cleanContent = sourceFile.getText();

            // Check individual style usage patterns - iterate over current definitions
            const keysToCheck = Array.from(this.styleDefinitions.keys());
            for (const key of keysToCheck) {
                if (this.isStyleUsedInContent(key, cleanContent)) {
                    // Remove the key from definitions since it's used
                    this.styleDefinitions.delete(key);
                }
            }
        } catch (error) {
            // Fallback: use original content if AST parsing fails
            console.warn(`Warning: Could not parse ${file} with AST, using original content`);
            const keysToCheck = Array.from(this.styleDefinitions.keys());
            for (const key of keysToCheck) {
                if (this.isStyleUsedInContent(key, content)) {
                    this.styleDefinitions.delete(key);
                }
            }
        }
    }

    private checkSpreadPatternsInStylesFile(content: string): void {
        // Look for specific property spreads like ...positioning.pFixed
        const specificMatches = content.matchAll(SPREAD_PROPERTY_PATTERN);
        for (const match of specificMatches) {
            const objectName = match[1]; // e.g., "text", "positioning", "colors"
            const propertyName = match[2]; // e.g., "textMatch", "pFixed", "primary"

            // Mark BOTH the object name and property name as used by removing from definitions
            if (this.styleDefinitions.has(objectName)) {
                this.styleDefinitions.delete(objectName);
            }

            if (this.styleDefinitions.has(propertyName)) {
                this.styleDefinitions.delete(propertyName);
            }
        }

        // Look for simple spread patterns like ...baseStyle (excludes property spreads via negative lookahead)
        const simpleMatches = content.matchAll(SIMPLE_SPREAD_PATTERN);
        for (const match of simpleMatches) {
            const objectName = match[1]; // e.g., "baseStyle"

            // Mark the object name as used by removing from definitions
            if (this.styleDefinitions.has(objectName)) {
                this.styleDefinitions.delete(objectName);
            }
        }
    }

    private isStyleUsedInContent(key: string, content: string): boolean {
        // Fast check: if the key doesn't appear at all in the content, it's not used
        if (!content.includes(key)) {
            return false;
        }

        // Most common usage patterns - check these first for performance
        const commonPatterns = [
            // Direct property access (90% of cases)
            new RegExp(`\\w+\\.${key}\\b`, 'g'), // styles.key, theme.key, etc.

            // Destructuring (common in React)
            new RegExp(`\\{[^}]*\\b${key}\\b[^}]*\\}`, 'g'), // {key} or {other, key}

            // Object key access
            new RegExp(`\\[['"\`]${key}['"\`]\\]`, 'g'), // ['key'] or ["key"]

            // Object property definition
            new RegExp(`\\b${key}\\s*:`, 'g'), // key: value

            // Import/export
            new RegExp(`(import|export)\\s+.*\\b${key}\\b`, 'g'),
        ];

        // Test common patterns first
        for (const pattern of commonPatterns) {
            if (pattern.test(content)) {
                return true;
            }
        }

        // Less common patterns (only check if not found above)
        const rarePatterns = [
            // Function calls
            new RegExp(`\\b${key}\\s*\\(`, 'g'), // key(...)

            // Assignments and conditionals
            new RegExp(`[=?&|]\\s*${key}\\b`, 'g'), // = key, ? key, && key, || key
            new RegExp(`\\b${key}\\s*[?&|=]`, 'g'), // key =, key ?, key &&, key ||

            // Template literals
            new RegExp(`\\\`[^\\\`]*\\$\\{[^}]*${key}[^}]*\\}[^\\\`]*\\\``, 'g'),

            // Array/function parameters
            new RegExp(`[\\[\\(,]\\s*${key}\\s*[\\]\\),]`, 'g'),
        ];

        for (const pattern of rarePatterns) {
            if (pattern.test(content)) {
                return true;
            }
        }

        return false;
    }

    private getUnusedStyles(): StyleDefinition[] {
        // Whatever remains in styleDefinitions are the unused styles
        const unused = Array.from(this.styleDefinitions.values());
        return unused.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    }
}

// CLI interface
function main() {
    const rootDir = process.cwd();

    try {
        const finder = new ComprehensiveStylesFinder(rootDir);
        const unusedStyles = finder.findUnusedStyles();

        if (unusedStyles.length === 0) {
            console.log('✅ No unused styles found!');
            process.exit(0);
        }

        console.log(`Found ${unusedStyles.length} unused styles:`);
        console.log('');

        const groupedByFile: Record<string, StyleDefinition[]> = {};
        for (const style of unusedStyles) {
            if (!groupedByFile[style.file]) {
                groupedByFile[style.file] = [];
            }
            groupedByFile[style.file].push(style);
        }

        for (const [file, styles] of Object.entries(groupedByFile)) {
            console.log(`📁 ${file}:`);
            for (const style of styles) {
                console.log(`  - ${style.key} (line ${style.line}:${style.column})`);
            }
            console.log('');
        }

        if (process.argv.includes('--exit-code')) {
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error analyzing styles:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export {ComprehensiveStylesFinder};
export type {StyleDefinition};
