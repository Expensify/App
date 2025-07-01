#!/usr/bin/env node
import * as fs from 'fs';
import {globSync} from 'glob';
import * as path from 'path';
import * as ts from 'typescript';

interface StyleDefinition {
    key: string;
    file: string;
    line: number;
    column: number;
    exportName?: string;
    parentObject?: string; // Track which object this property belongs to
}

interface ImportInfo {
    localName: string;
    importedName: string;
    modulePath: string;
}

interface ObjectUsage {
    objectName: string;
    file: string;
    usageType: 'spread' | 'property-access' | 'destructuring' | 'full-object';
}

class UnusedStylesFinder {
    private styleDefinitions = new Map<string, StyleDefinition>();
    private styleUsages = new Set<string>();
    private objectUsages = new Set<string>(); // Track when entire objects are used
    private program: ts.Program;
    private fileImports = new Map<string, ImportInfo[]>();
    private exportedObjects = new Map<string, Set<string>>();
    private fileToExportMap = new Map<string, string>(); // Map file paths to their main export names

    constructor(private rootDir: string) {
        const configPath = ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.json');
        if (!configPath) {
            throw new Error('Could not find tsconfig.json');
        }

        const config = ts.readConfigFile(configPath, ts.sys.readFile);
        const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, rootDir);

        this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    }

    async findUnusedStyles(): Promise<StyleDefinition[]> {
        console.log('🔍 Step 1: Scanning for style definitions...');
        await this.findStyleDefinitions();

        console.log(`Found ${this.styleDefinitions.size} style definitions`);
        console.log('🔍 Step 2: Analyzing imports and exports...');
        await this.analyzeImportsAndExports();

        console.log('🔍 Step 3: Scanning for style usages...');
        await this.findStyleUsages();

        console.log(`Found ${this.styleUsages.size} direct style usages`);
        console.log(`Found ${this.objectUsages.size} object-level usages`);
        console.log('🔍 Step 4: Resolving object usages...');
        this.resolveObjectUsages();

        console.log('📊 Analyzing results...');
        return this.getUnusedStyles();
    }

    private async findStyleDefinitions(): Promise<void> {
        const styleFiles = globSync('src/styles/**/*.{ts,tsx,js,jsx}', {
            cwd: this.rootDir,
        }) as string[];

        console.log(`Scanning ${styleFiles.length} style files...`);

        for (const file of styleFiles) {
            const fullPath = path.join(this.rootDir, file);

            try {
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const sourceFile = ts.createSourceFile(fullPath, fileContent, ts.ScriptTarget.Latest, true);

                this.visitNodeForStyles(sourceFile, file, sourceFile);
            } catch (error) {
                console.warn(`Warning: Could not read style file ${file}:`, error);
            }
        }
    }

    private visitNodeForStyles(node: ts.Node, file: string, sourceFile: ts.SourceFile): void {
        // Look for variable declarations
        if (ts.isVariableDeclaration(node) && node.initializer) {
            const varName = ts.isIdentifier(node.name) ? node.name.text : undefined;

            if (ts.isObjectLiteralExpression(node.initializer)) {
                this.extractStylesFromObject(node.initializer, file, sourceFile, varName, varName);

                // Map this file to its main export
                if (varName) {
                    this.fileToExportMap.set(file, varName);
                }
            }

            // Handle function calls that return objects (like functions that generate styles)
            if (ts.isCallExpression(node.initializer)) {
                if (varName) {
                    this.fileToExportMap.set(file, varName);
                }
            }
        }

        // Look for default exports
        if (ts.isExportAssignment(node)) {
            if (ts.isObjectLiteralExpression(node.expression)) {
                this.extractStylesFromObject(node.expression, file, sourceFile, 'default', 'default');
                this.fileToExportMap.set(file, 'default');
            }

            if (ts.isIdentifier(node.expression)) {
                this.fileToExportMap.set(file, node.expression.text);
            }
        }

        // Look for StyleSheet.create calls
        if (ts.isCallExpression(node)) {
            if (ts.isPropertyAccessExpression(node.expression)) {
                const obj = node.expression.expression;
                const method = node.expression.name;

                if (ts.isIdentifier(obj) && ts.isIdentifier(method)) {
                    if (obj.text === 'StyleSheet' && method.text === 'create') {
                        if (node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
                            this.extractStylesFromObject(node.arguments[0], file, sourceFile);
                        }
                    }
                }
            }
        }

        ts.forEachChild(node, (child) => this.visitNodeForStyles(child, file, sourceFile));
    }

    private extractStylesFromObject(obj: ts.ObjectLiteralExpression, file: string, sourceFile: ts.SourceFile, exportName?: string, parentObject?: string): void {
        obj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop)) {
                let key: string | undefined;

                if (ts.isIdentifier(prop.name)) {
                    key = prop.name.text;
                } else if (ts.isStringLiteral(prop.name)) {
                    key = prop.name.text;
                }

                if (key) {
                    try {
                        const {line, character} = sourceFile.getLineAndCharacterOfPosition(prop.getStart());

                        this.styleDefinitions.set(key, {
                            key,
                            file,
                            line: line + 1,
                            column: character + 1,
                            exportName,
                            parentObject,
                        });
                    } catch (error) {
                        console.warn(`Warning: Could not get position for style '${key}' in ${file}`);
                        this.styleDefinitions.set(key, {
                            key,
                            file,
                            line: 0,
                            column: 0,
                            exportName,
                            parentObject,
                        });
                    }
                }
            }

            if (ts.isMethodDeclaration(prop) && ts.isIdentifier(prop.name)) {
                const key = prop.name.text;
                try {
                    const {line, character} = sourceFile.getLineAndCharacterOfPosition(prop.getStart());

                    this.styleDefinitions.set(key, {
                        key,
                        file,
                        line: line + 1,
                        column: character + 1,
                        exportName,
                        parentObject,
                    });
                } catch (error) {
                    console.warn(`Warning: Could not get position for method style '${key}' in ${file}`);
                    this.styleDefinitions.set(key, {
                        key,
                        file,
                        line: 0,
                        column: 0,
                        exportName,
                        parentObject,
                    });
                }
            }
        });
    }

    private async analyzeImportsAndExports(): Promise<void> {
        const allFiles = globSync('src/**/*.{ts,tsx,js,jsx}', {
            cwd: this.rootDir,
        });

        for (const file of allFiles) {
            const fullPath = path.join(this.rootDir, file);

            try {
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const sourceFile = ts.createSourceFile(fullPath, fileContent, ts.ScriptTarget.Latest, true);

                this.analyzeFileImportsExports(sourceFile, file);
            } catch (error) {
                console.warn(`Warning: Could not analyze imports/exports for ${file}:`, error);
            }
        }
    }

    private analyzeFileImportsExports(sourceFile: ts.SourceFile, file: string): void {
        const imports: ImportInfo[] = [];
        const exports = new Set<string>();

        const visit = (node: ts.Node) => {
            if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                const modulePath = node.moduleSpecifier.text;

                if (node.importClause) {
                    if (node.importClause.name && ts.isIdentifier(node.importClause.name)) {
                        imports.push({
                            localName: node.importClause.name.text,
                            importedName: 'default',
                            modulePath,
                        });
                    }

                    if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
                        node.importClause.namedBindings.elements.forEach((element) => {
                            if (ts.isIdentifier(element.name)) {
                                const importedName = element.propertyName ? element.propertyName.text : element.name.text;
                                imports.push({
                                    localName: element.name.text,
                                    importedName,
                                    modulePath,
                                });
                            }
                        });
                    }

                    if (node.importClause.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
                        imports.push({
                            localName: node.importClause.namedBindings.name.text,
                            importedName: '*',
                            modulePath,
                        });
                    }
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        this.fileImports.set(file, imports);
        this.exportedObjects.set(file, exports);
    }

    private async findStyleUsages(): Promise<void> {
        const sourceFiles = globSync('src/**/*.{ts,tsx,js,jsx}', {
            cwd: this.rootDir,
        });

        console.log(`Scanning ${sourceFiles.length} source files for style usages...`);

        for (const file of sourceFiles) {
            const fullPath = path.join(this.rootDir, file);

            try {
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const sourceFile = ts.createSourceFile(fullPath, fileContent, ts.ScriptTarget.Latest, true);

                this.visitNodeForUsages(sourceFile, file);
            } catch (error) {
                console.warn(`Warning: Could not read source file ${file}:`, error);
            }
        }
    }

    private visitNodeForUsages(node: ts.Node, currentFile: string): void {
        const fileImports = this.fileImports.get(currentFile) || [];

        // Look for property access expressions
        if (ts.isPropertyAccessExpression(node)) {
            if (ts.isIdentifier(node.expression) && ts.isIdentifier(node.name)) {
                const objName = node.expression.text;
                const propertyName = node.name.text;

                const importInfo = fileImports.find((imp) => imp.localName === objName);
                if (importInfo) {
                    this.styleUsages.add(propertyName);

                    // If this is a nested access like FontUtils.fontFamily.platform.SYSTEM
                    // Mark the top-level property as used
                    this.checkForNestedPropertyAccess(node, importInfo, currentFile);
                } else if (this.isStyleObjectName(objName)) {
                    this.styleUsages.add(propertyName);
                }
            }
        }

        // Look for bracket notation
        if (ts.isElementAccessExpression(node)) {
            if (ts.isIdentifier(node.expression)) {
                const objName = node.expression.text;

                if (ts.isStringLiteral(node.argumentExpression)) {
                    const propertyName = node.argumentExpression.text;

                    const importInfo = fileImports.find((imp) => imp.localName === objName);
                    if (importInfo) {
                        this.styleUsages.add(propertyName);
                    } else if (this.isStyleObjectName(objName)) {
                        this.styleUsages.add(propertyName);
                    }
                }
            }
        }

        // Look for destructuring
        if (ts.isVariableDeclaration(node) && node.initializer) {
            if (ts.isIdentifier(node.initializer)) {
                const initName = node.initializer.text;

                const importInfo = fileImports.find((imp) => imp.localName === initName);
                if (importInfo || this.isStyleObjectName(initName)) {
                    if (node.name && ts.isObjectBindingPattern(node.name)) {
                        node.name.elements.forEach((element) => {
                            if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
                                this.styleUsages.add(element.name.text);
                            }
                        });
                    }
                }
            }
        }

        // Look for object spread - THIS IS KEY FOR YOUR ISSUE
        if (ts.isSpreadAssignment(node)) {
            if (ts.isIdentifier(node.expression)) {
                const objName = node.expression.text;

                const importInfo = fileImports.find((imp) => imp.localName === objName);
                if (importInfo) {
                    // Mark this entire object as used via spread
                    this.objectUsages.add(objName);
                    console.log(`🔍 Object spread detected: ${objName} from ${importInfo.modulePath}`);
                } else if (this.isStyleObjectName(objName)) {
                    this.objectUsages.add(objName);
                }
            }
        }

        // Look for spread in object literals like {...chatContentScrollViewPlatformStyles}
        if (ts.isObjectLiteralExpression(node)) {
            node.properties.forEach((prop) => {
                if (ts.isSpreadAssignment(prop) && ts.isIdentifier(prop.expression)) {
                    const objName = prop.expression.text;
                    const importInfo = fileImports.find((imp) => imp.localName === objName);
                    if (importInfo) {
                        this.objectUsages.add(objName);
                        console.log(`🔍 Object spread in literal detected: ${objName}`);
                    }
                }
            });
        }

        // Look for template literals
        if (ts.isTemplateExpression(node)) {
            node.templateSpans.forEach((span) => {
                if (ts.isPropertyAccessExpression(span.expression)) {
                    if (ts.isIdentifier(span.expression.expression) && ts.isIdentifier(span.expression.name)) {
                        const objName = span.expression.expression.text;
                        const propertyName = span.expression.name.text;

                        const importInfo = fileImports.find((imp) => imp.localName === objName);
                        if (importInfo || this.isStyleObjectName(objName)) {
                            this.styleUsages.add(propertyName);
                        }
                    }
                }
            });
        }

        // Look for function calls with style arguments
        if (ts.isCallExpression(node)) {
            node.arguments.forEach((arg) => {
                if (ts.isPropertyAccessExpression(arg)) {
                    if (ts.isIdentifier(arg.expression) && ts.isIdentifier(arg.name)) {
                        const objName = arg.expression.text;
                        const propertyName = arg.name.text;

                        const importInfo = fileImports.find((imp) => imp.localName === objName);
                        if (importInfo || this.isStyleObjectName(objName)) {
                            this.styleUsages.add(propertyName);
                        }
                    }
                }

                // Handle spread arguments like fn(...styles)
                if (ts.isSpreadElement(arg) && ts.isIdentifier(arg.expression)) {
                    const objName = arg.expression.text;
                    const importInfo = fileImports.find((imp) => imp.localName === objName);
                    if (importInfo) {
                        this.objectUsages.add(objName);
                    }
                }
            });
        }

        ts.forEachChild(node, (child) => this.visitNodeForUsages(child, currentFile));
    }

    private checkForNestedPropertyAccess(node: ts.PropertyAccessExpression, importInfo: ImportInfo, currentFile: string): void {
        // For patterns like FontUtils.fontFamily.platform.SYSTEM
        // We want to mark SYSTEM as used since the chain leads to it
        let current = node;
        const accessChain: string[] = [];

        while (ts.isPropertyAccessExpression(current)) {
            if (ts.isIdentifier(current.name)) {
                accessChain.unshift(current.name.text);
            }

            if (ts.isIdentifier(current.expression)) {
                accessChain.unshift(current.expression.text);
                break;
            } else if (ts.isPropertyAccessExpression(current.expression)) {
                current = current.expression;
            } else {
                break;
            }
        }

        // If we have a chain like FontUtils.fontFamily.platform.SYSTEM
        // Mark 'SYSTEM' as used
        if (accessChain.length > 2) {
            const finalProperty = accessChain[accessChain.length - 1];
            this.styleUsages.add(finalProperty);
            console.log(`🔍 Nested property access: ${accessChain.join('.')} -> marking '${finalProperty}' as used`);
        }
    }

    private resolveObjectUsages(): void {
        // When an object is used via spread or as a whole, mark all its properties as used
        const fileImports = Array.from(this.fileImports.values()).flat();

        for (const usedObject of this.objectUsages) {
            console.log(`🔍 Resolving usage for object: ${usedObject}`);

            // Find the import info for this object
            const importInfo = fileImports.find((imp) => imp.localName === usedObject);
            if (importInfo) {
                // Find the file that exports this object
                const exportingFile = this.resolveModulePath(importInfo.modulePath);
                if (exportingFile) {
                    // Mark all properties from that file as used
                    for (const [key, definition] of this.styleDefinitions) {
                        if (definition.file === exportingFile) {
                            this.styleUsages.add(key);
                            console.log(`  ✅ Marking '${key}' as used (from spread/object usage)`);
                        }
                    }
                }
            }
        }
    }

    private resolveModulePath(modulePath: string): string | undefined {
        // Convert relative import path to actual file path
        if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
            // Handle relative paths
            const resolvedPath = path.normalize(modulePath);
            const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];

            for (const ext of possibleExtensions) {
                const fullPath = `src/styles/${resolvedPath}${ext}`;
                if (this.fileToExportMap.has(fullPath)) {
                    return fullPath;
                }
            }
        }

        // Try direct mapping
        return this.fileToExportMap.has(modulePath) ? modulePath : undefined;
    }

    private isStyleObjectName(name: string): boolean {
        const stylePatterns = [
            'styles',
            'theme',
            'themeStyles',
            'defaultStyles',
            'componentStyles',
            'colors',
            'fontUtils',
            'modalStyle',
            'chatContentScrollViewPlatformStyles',
            'overflowXHidden',
            'defaultInsets',
        ];

        return stylePatterns.some(
            (pattern) =>
                name === pattern ||
                name.toLowerCase().includes('style') ||
                name.toLowerCase().includes('theme') ||
                name.toLowerCase().includes('color') ||
                name.toLowerCase().includes('font'),
        );
    }

    private getUnusedStyles(): StyleDefinition[] {
        const unused: StyleDefinition[] = [];

        for (const [key, definition] of this.styleDefinitions) {
            if (!this.styleUsages.has(key)) {
                unused.push(definition);
            }
        }

        return unused.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    }
}

// CLI interface
async function main() {
    const rootDir = process.cwd();

    try {
        const finder = new UnusedStylesFinder(rootDir);
        const unusedStyles = await finder.findUnusedStyles();

        if (unusedStyles.length === 0) {
            console.log('✅ No unused styles found!');
            process.exit(0);
        }

        console.log(`❌ Found ${unusedStyles.length} unused styles:`);
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
                if (style.line > 0) {
                    console.log(`  - ${style.key} (line ${style.line}:${style.column})`);
                } else {
                    console.log(`  - ${style.key}`);
                }
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
