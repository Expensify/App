import * as fs from 'fs';
import {globSync} from 'glob';
import * as path from 'path';
import * as ts from 'typescript';
import TSCompilerUtils from './utils/TSCompilerUtils';

type StyleDefinition = {
    key: string;
    file: string;
    line: number;
    column: number;
};

// Static patterns and constants - created once
const STYLE_FILE_EXTENSIONS = '**/*.{ts,tsx}';
const STYLE_KEY_SKIP_PATTERNS = new Set(['default', 'exports', 'module', 'require', 'import', 'from', 'theme', 'colors', 'variables', 'CONST', 'Platform', 'StyleSheet']);
// Use EXCLUDED_STYLE_DIRS to clarify which directories are being ignored
const EXCLUDED_STYLE_DIRS = ['src/styles/utils/**', 'src/styles/generators/**', 'src/styles/theme/**'];

class ComprehensiveStylesFinder {
    private rootDir: string;

    private styleDefinitions = new Map<string, StyleDefinition>();

    private fileContents = new Map<string, string>();

    constructor(rootDir: string) {
        this.rootDir = rootDir;
    }

    public findUnusedStyles(): StyleDefinition[] {
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
        const styleFiles = globSync(`src/styles/${STYLE_FILE_EXTENSIONS}`, {
            cwd: this.rootDir,
            ignore: EXCLUDED_STYLE_DIRS,
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
                            this.extractStyleDefinitionsFromObject(returnObject, sourceFile, file);

                            // After processing style definitions, check for spread patterns within this styles file
                            const fileContent = sourceFile.getFullText();
                            this.checkSpreadPatternsInStylesFile(fileContent, file);
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
                this.extractStyleDefinitionFromNode(node, sourceFile, file);
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
    }

    /**
     * Extracts style definitions from a TypeScript object literal expression.
     *
     * This function scans through all properties in an object literal (typically the main styles object)
     * and identifies valid style definitions. It captures both:
     * - Property assignments with object literal values (e.g., `myStyle: { color: 'red' }`)
     * - Method declarations that return styles (e.g., `myStyle: () => ({ color: 'red' })`)
     *
     * Valid style definitions are added to the styleDefinitions map with their source location
     * for later unused style detection.
     *
     * @param objectLiteral - The TypeScript object literal expression to scan for style definitions
     * @param sourceFile - The TypeScript source file containing the object literal
     * @param file - The relative file path for tracking style definition locations
     */
    private extractStyleDefinitionsFromObject(objectLiteral: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile, file: string): void {
        for (const property of objectLiteral.properties) {
            if (ts.isPropertyAssignment(property) || ts.isMethodDeclaration(property)) {
                const key = TSCompilerUtils.extractKeyFromPropertyNode(property);

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

    /**
     * Extracts a style definition from an individual TypeScript AST node.
     *
     * This function processes individual AST nodes (typically during tree traversal) to identify
     * style definitions in non-main style files. It handles three types of style definitions:
     * - Property assignments with object literal values (e.g., `myStyle: { color: 'red' }`)
     * - Method declarations that return styles (e.g., `myStyle: () => ({ color: 'red' })`)
     * - Variable declarations that define styles (e.g., `const myStyle = { color: 'red' }`)
     *
     * @param node - The TypeScript AST node to check for style definitions
     * @param sourceFile - The TypeScript source file containing the node
     * @param file - The relative file path for tracking style definition locations
     */
    private extractStyleDefinitionFromNode(node: ts.Node, sourceFile: ts.SourceFile, file: string): void {
        // Look for object literal properties (style definitions)
        if (ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) {
            const key = TSCompilerUtils.extractKeyFromPropertyNode(node);

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
        if (STYLE_KEY_SKIP_PATTERNS.has(key)) {
            return false;
        }

        return true;
    }

    private loadAllFileContents(): void {
        // Use excludeMainStyleFiles to exclude only the main style definition files
        // Keep utils/generators/themes for usage checking
        const excludeMainStyleFiles = ['src/styles/index.ts', 'src/styles/variables.ts'];

        const sourceFiles = globSync(`src/**/${STYLE_FILE_EXTENSIONS}`, {
            cwd: this.rootDir,
            ignore: excludeMainStyleFiles,
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
                if (this.isStyleUsedInContent(key, cleanContent, file)) {
                    // Remove the key from definitions since it's used
                    this.styleDefinitions.delete(key);
                }
            }
        } catch (error) {
            // Fallback: use original content if AST parsing fails
            console.warn(`Warning: Could not parse ${file} with AST, using original content`);
            const keysToCheck = Array.from(this.styleDefinitions.keys());
            for (const key of keysToCheck) {
                if (this.isStyleUsedInContent(key, content, file)) {
                    this.styleDefinitions.delete(key);
                }
            }
        }
    }

    private checkSpreadPatternsInStylesFile(content: string, file: string): void {
        try {
            const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

            const visit = (node: ts.Node) => {
                // Handle object spread assignments (in object literals)
                if (ts.isSpreadAssignment(node)) {
                    this.handleSpreadExpression(node.expression);
                }

                // Handle array/function spread elements
                else if (ts.isSpreadElement(node)) {
                    this.handleSpreadExpression(node.expression);
                }

                ts.forEachChild(node, visit);
            };

            visit(sourceFile);
        } catch (error) {
            console.warn(`Warning: Could not parse ${file} for spread detection:`, error);
        }
    }

    private handleSpreadExpression(expression: ts.Expression): void {
        // Simple spreads like ...baseStyle
        if (ts.isIdentifier(expression)) {
            const objectName = expression.text;
            if (this.styleDefinitions.has(objectName)) {
                this.styleDefinitions.delete(objectName);
            }
        }

        // Property access spreads like ...positioning.pFixed
        else if (ts.isPropertyAccessExpression(expression)) {
            if (ts.isIdentifier(expression.expression) && ts.isIdentifier(expression.name)) {
                const objectName = expression.expression.text;
                const propertyName = expression.name.text;

                // Mark BOTH the object name and property name as used
                if (this.styleDefinitions.has(objectName)) {
                    this.styleDefinitions.delete(objectName);
                }
                if (this.styleDefinitions.has(propertyName)) {
                    this.styleDefinitions.delete(propertyName);
                }
            }
            // For complex property access (e.g., ...theme.styles.button)
            else {
                this.extractIdentifiersFromExpression(expression);
            }
        }

        // Element access spreads like ...styles['key']
        else if (ts.isElementAccessExpression(expression)) {
            if (ts.isIdentifier(expression.expression)) {
                const objectName = expression.expression.text;
                if (this.styleDefinitions.has(objectName)) {
                    this.styleDefinitions.delete(objectName);
                }
            }
            // Also check if the key is a string literal
            if (ts.isStringLiteral(expression.argumentExpression)) {
                const key = expression.argumentExpression.text;
                if (this.styleDefinitions.has(key)) {
                    this.styleDefinitions.delete(key);
                }
            }
        }

        // For all other complex expressions, extract any identifiers
        else {
            this.extractIdentifiersFromExpression(expression);
        }
    }

    private extractIdentifiersFromExpression(expression: ts.Expression): void {
        const visit = (node: ts.Node) => {
            if (ts.isIdentifier(node)) {
                const name = node.text;
                if (this.styleDefinitions.has(name)) {
                    this.styleDefinitions.delete(name);
                }
            }
            ts.forEachChild(node, visit);
        };

        visit(expression);
    }

    private isStyleUsedInContent(key: string, content: string, file: string): boolean {
        // Fast check: if the key doesn't appear at all in the content, it's not used
        if (!content.includes(key)) {
            return false;
        }

        try {
            const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

            let found = false;

            const visit = (node: ts.Node) => {
                if (found) {
                    return; // Early termination for performance
                }

                // Property access: obj.key, styles.key, theme.key
                if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name) && node.name.text === key) {
                    found = true;
                    return;
                }

                // Identifier: key (in destructuring, assignments, etc.)
                if (ts.isIdentifier(node) && node.text === key) {
                    // Exclude property names in object literals (e.g., {key: value} where key is the property name)
                    const parent = node.parent;
                    if (ts.isPropertyAssignment(parent) && parent.name === node) {
                        // This is a property name, not a usage
                        ts.forEachChild(node, visit);
                        return;
                    }
                    if (ts.isMethodDeclaration(parent) && parent.name === node) {
                        // This is a method name, not a usage
                        ts.forEachChild(node, visit);
                        return;
                    }
                    if (ts.isGetAccessorDeclaration(parent) && parent.name === node) {
                        // This is a getter name, not a usage
                        ts.forEachChild(node, visit);
                        return;
                    }
                    if (ts.isSetAccessorDeclaration(parent) && parent.name === node) {
                        // This is a setter name, not a usage
                        ts.forEachChild(node, visit);
                        return;
                    }

                    found = true;
                    return;
                }

                // Element access: obj["key"], obj['key']
                if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression) && node.argumentExpression.text === key) {
                    found = true;
                    return;
                }

                // Template literal usage: `${key}` or `text-${key}-more`
                if (ts.isTemplateExpression(node)) {
                    for (const span of node.templateSpans) {
                        if (ts.isIdentifier(span.expression) && span.expression.text === key) {
                            found = true;
                            return;
                        }
                        // Also check for property access in template spans
                        if (ts.isPropertyAccessExpression(span.expression) && ts.isIdentifier(span.expression.name) && span.expression.name.text === key) {
                            found = true;
                            return;
                        }
                    }
                }

                // Tagged template literals: css`${key}`
                if (ts.isTaggedTemplateExpression(node) && ts.isTemplateExpression(node.template)) {
                    for (const span of node.template.templateSpans) {
                        if (ts.isIdentifier(span.expression) && span.expression.text === key) {
                            found = true;
                            return;
                        }
                    }
                }

                ts.forEachChild(node, visit);
            };

            visit(sourceFile);
            return found;
        } catch (error) {
            // Fallback to simple text search if AST parsing fails
            console.warn(`Warning: Could not parse ${file} for usage detection, falling back to text search`);
            return content.includes(key);
        }
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

        console.error(`Found ${unusedStyles.length} unused styles:`);
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

        process.exit(1);
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
