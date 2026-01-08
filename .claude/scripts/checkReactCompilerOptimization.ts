#!/usr/bin/env -S npx ts-node
/**
 * Check React Compiler optimization status for a file and its imported components.
 *
 * Usage: ts-node checkReactCompilerOptimization.ts <file-path>
 * Output: JSON with optimization status for parent and all imported children
 */
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

type PlatformVariant = {
    path: string;
    platform: string;
};

type StandardImport = {
    name: string;
    originalName: string;
    module: string;
    isDefault: boolean;
};

type NamespaceImport = {
    namespaceName: string;
    module: string;
};

type ImportData = {
    usedAs: string;
    originalName: string;
    variants: PlatformVariant[];
};

type VariantResult = {
    optimized: boolean;
    platform: string;
    sourcePath: string;
};

type ChildComponentResult = {
    variants: VariantResult[];
};

type Result = {
    parentOptimized: string[];
    childComponents: Record<string, ChildComponentResult>;
};

// Load tsconfig once
const configPath = ts.findConfigFile(process.cwd(), (fileName) => ts.sys.fileExists(fileName), 'tsconfig.json');
if (!configPath) {
    console.error('Could not find tsconfig.json');
    process.exit(1);
}
const configFile = ts.readConfigFile(configPath, (fileName) => ts.sys.readFile(fileName));
const {options} = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

/**
 * Find platform variants for a resolved file path.
 * E.g., for index.tsx, find index.native.tsx, index.ios.tsx, etc.
 */
function findPlatformVariants(resolvedPath: string): PlatformVariant[] {
    const dir = path.dirname(resolvedPath);
    const basename = path.basename(resolvedPath);
    const variants: PlatformVariant[] = [];

    // Platform suffixes to check
    const platforms = ['native', 'ios', 'android', 'web'];

    const ext = path.extname(basename);
    const nameWithoutExt = path.basename(basename, ext);

    // Add the default file first
    if (fs.existsSync(resolvedPath)) {
        variants.push({path: resolvedPath, platform: 'default'});
    }

    // Check for platform-specific variants
    for (const platform of platforms) {
        const variantName = `${nameWithoutExt}.${platform}${ext}`;
        const variantPath = path.join(dir, variantName);
        if (fs.existsSync(variantPath)) {
            variants.push({path: variantPath, platform});
        }
    }

    return variants;
}

/**
 * Extract import information from file using regex.
 * Returns object with:
 *   - standardImports: array of {name, originalName, module, isDefault}
 *   - namespaceImports: array of {namespaceName, module}
 */
function getImports(filePath: string): {standardImports: StandardImport[]; namespaceImports: NamespaceImport[]} {
    const content = fs.readFileSync(filePath, 'utf8');
    const standardImports: StandardImport[] = [];
    const namespaceImports: NamespaceImport[] = [];

    // Standard imports: default and named
    const standardRegex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g;

    for (const match of content.matchAll(standardRegex)) {
        const [, defaultImport, namedImports, modulePath] = match;

        // Skip external packages (react, react-native, lodash, etc.)
        if (!modulePath.startsWith('@') && !modulePath.startsWith('.')) {
            continue;
        }

        if (defaultImport) {
            standardImports.push({name: defaultImport, originalName: defaultImport, module: modulePath, isDefault: true});
        }

        if (namedImports) {
            for (const n of namedImports.split(',')) {
                const parts = n.trim().split(/\s+as\s+/);
                const originalName = parts.at(0)?.trim();
                const aliasName = parts.length > 1 ? parts.at(1)?.trim() : originalName;
                if (originalName && !originalName.startsWith('type ') && aliasName) {
                    standardImports.push({name: aliasName, originalName, module: modulePath, isDefault: false});
                }
            }
        }
    }

    // Namespace imports: import * as X from '...'
    const namespaceRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
    for (const match of content.matchAll(namespaceRegex)) {
        const [, namespaceName, modulePath] = match;

        // Skip external packages
        if (!modulePath.startsWith('@') && !modulePath.startsWith('.')) {
            continue;
        }

        namespaceImports.push({namespaceName, module: modulePath});
    }

    return {standardImports, namespaceImports};
}

/**
 * Find which members of a namespace are actually used in the file content.
 * Returns array of member names (e.g., ['GenericPressable', 'PressableWithFeedback'])
 */
function findNamespaceUsage(content: string, namespaceName: string): string[] {
    const usedMembers = new Set<string>();
    // Match Namespace.MemberName where MemberName starts with capital letter (component)
    const usageRegex = new RegExp(`${namespaceName}\\.([A-Z]\\w+)`, 'g');

    for (const match of content.matchAll(usageRegex)) {
        const member = match.at(1);
        if (member) {
            usedMembers.add(member);
        }
    }

    return [...usedMembers];
}

/**
 * Resolve import to actual source file using TypeChecker.
 * This follows re-exports to find the real file where the component is defined.
 * For default imports, also resolves the actual exported name.
 */
function resolveImportToSourceFile(
    program: ts.Program,
    checker: ts.TypeChecker,
    fromFile: string,
    modulePath: string,
    exportName: string,
    isDefault: boolean,
): {filePath: string; originalName: string} | null {
    const sourceFile = program.getSourceFile(fromFile);
    if (!sourceFile) {
        return null;
    }

    // Get the module specifier's resolved file
    const resolvedModule = ts.resolveModuleName(modulePath, fromFile, options, ts.sys);
    if (!resolvedModule.resolvedModule) {
        return null;
    }

    const resolvedFileName = resolvedModule.resolvedModule.resolvedFileName;

    // Get the resolved source file for TypeChecker operations
    const resolvedSourceFile = program.getSourceFile(resolvedFileName);
    if (!resolvedSourceFile) {
        return {filePath: resolvedFileName, originalName: exportName};
    }

    const moduleSymbol = checker.getSymbolAtLocation(resolvedSourceFile);
    if (!moduleSymbol) {
        return {filePath: resolvedFileName, originalName: exportName};
    }

    // For default imports, get the actual exported name
    if (isDefault) {
        try {
            const defaultExport = moduleSymbol.exports?.get('default' as ts.__String);
            if (defaultExport) {
                const aliasedSymbol = checker.getAliasedSymbol(defaultExport);
                const actualName = aliasedSymbol.getName();
                // Also check if it's re-exported from another file
                const declarations = aliasedSymbol.getDeclarations();
                const firstDeclaration = declarations?.at(0);
                if (firstDeclaration) {
                    const actualSourceFile = firstDeclaration.getSourceFile();
                    return {filePath: actualSourceFile.fileName, originalName: actualName};
                }
                return {filePath: resolvedFileName, originalName: actualName};
            }
        } catch {
            // Fall back to import name if we can't resolve
        }
        return {filePath: resolvedFileName, originalName: exportName};
    }

    // For named imports, try to follow re-exports using TypeChecker
    const exports = checker.getExportsOfModule(moduleSymbol);
    const exportSymbol = exports.find((exp) => exp.getName() === exportName);

    if (!exportSymbol) {
        return {filePath: resolvedFileName, originalName: exportName};
    }

    // Follow the alias chain to find the actual source file
    try {
        const aliasedSymbol = checker.getAliasedSymbol(exportSymbol);
        const declarations = aliasedSymbol.getDeclarations();
        const firstDeclaration = declarations?.at(0);

        if (firstDeclaration) {
            const actualSourceFile = firstDeclaration.getSourceFile();
            return {filePath: actualSourceFile.fileName, originalName: exportName};
        }
    } catch {
        // If getAliasedSymbol fails (not an alias), use the original resolved file
    }

    return {filePath: resolvedFileName, originalName: exportName};
}

/**
 * Run react-compiler-healthcheck on specific files and parse output.
 * Returns Map<absolutePath, Set<componentNames>>
 */
function runHealthcheck(filePaths: string[]): Map<string, Set<string>> {
    if (!filePaths.length) {
        return new Map();
    }

    const fileNames = [...new Set(filePaths.map((p) => path.basename(p)))];
    const glob = `**/+(${fileNames.join('|')})`;

    let output = '';
    try {
        output = execSync(`npx react-compiler-healthcheck --src '${glob}' --verbose 2>&1`, {
            encoding: 'utf8',
            timeout: 120000,
        });
    } catch (e: unknown) {
        const error = e as {stdout?: string; message?: string};
        output = error.stdout ?? error.message ?? '';
    }

    return parseOutput(output);
}

/**
 * Parse healthcheck verbose output.
 * Returns Map<path, Set<componentNames>>
 */
function parseOutput(output: string): Map<string, Set<string>> {
    const results = new Map<string, Set<string>>();

    for (const line of output.split('\n')) {
        // Success: Successfully compiled component [Name](path)
        const success = line.match(/Successfully compiled (?:hook|component) \[([^\]]+)\]\(([^)]+)\)/);
        if (success) {
            const [, componentName, filePath] = success;
            const absolutePath = path.resolve(filePath);

            const existingSet = results.get(absolutePath);
            if (existingSet) {
                existingSet.add(componentName);
            } else {
                results.set(absolutePath, new Set([componentName]));
            }
        }
    }

    return results;
}

// Main
const inputFile = process.argv.at(2);
if (!inputFile) {
    console.error('Usage: ./checkReactCompilerOptimization.ts <file-path>');
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    console.error(`File not found: ${inputFile}`);
    process.exit(1);
}

const absoluteInputFile = path.resolve(inputFile);
const fileContent = fs.readFileSync(absoluteInputFile, 'utf8');
const {standardImports, namespaceImports} = getImports(absoluteInputFile);

// Create TypeScript program for symbol resolution
const program = ts.createProgram([absoluteInputFile], options);
const checker = program.getTypeChecker();

// Collect all files to check (including platform variants)
const allFilesToCheck = new Set<string>();
const importDataMap = new Map<string, ImportData>(); // usedAs -> {usedAs, originalName, variants}

// Add parent file and its variants
const parentVariants = findPlatformVariants(absoluteInputFile);
for (const variant of parentVariants) {
    allFilesToCheck.add(variant.path);
}

// Process standard imports
for (const imp of standardImports) {
    const resolved = resolveImportToSourceFile(program, checker, absoluteInputFile, imp.module, imp.originalName, imp.isDefault);

    if (resolved && (resolved.filePath.endsWith('.tsx') || resolved.filePath.endsWith('.ts'))) {
        const variants = findPlatformVariants(resolved.filePath);

        importDataMap.set(imp.name, {
            usedAs: imp.name,
            originalName: resolved.originalName,
            variants,
        });

        for (const variant of variants) {
            allFilesToCheck.add(variant.path);
        }
    }
}

// Process namespace imports - only include actually used members
for (const nsImport of namespaceImports) {
    const usedMembers = findNamespaceUsage(fileContent, nsImport.namespaceName);

    for (const memberName of usedMembers) {
        const resolved = resolveImportToSourceFile(program, checker, absoluteInputFile, nsImport.module, memberName, false);

        if (resolved && (resolved.filePath.endsWith('.tsx') || resolved.filePath.endsWith('.ts'))) {
            const variants = findPlatformVariants(resolved.filePath);
            const usedAs = `${nsImport.namespaceName}.${memberName}`;

            importDataMap.set(usedAs, {
                usedAs,
                originalName: resolved.originalName,
                variants,
            });

            for (const variant of variants) {
                allFilesToCheck.add(variant.path);
            }
        }
    }
}

// Run healthcheck on all files
const optimizationResults = runHealthcheck([...allFilesToCheck]);

// Get list of optimized components/hooks in parent file
const parentOptimizedSet = optimizationResults.get(absoluteInputFile) ?? new Set<string>();
const parentOptimized = [...parentOptimizedSet];

// Build output
const result: Result = {
    parentOptimized,
    childComponents: {},
};

// Add child components with their variants (simplified to boolean)
for (const [usedAs, data] of importDataMap) {
    result.childComponents[usedAs] = {
        variants: data.variants.map((variant) => {
            const optimizedSet = optimizationResults.get(variant.path) ?? new Set<string>();
            const isOptimized = optimizedSet.has(data.originalName);
            // Make path relative to cwd for cleaner output
            const relativePath = path.relative(process.cwd(), variant.path);
            return {
                optimized: isOptimized,
                platform: variant.platform,
                sourcePath: relativePath,
            };
        }),
    };
}

process.stdout.write(JSON.stringify(result, null, 2));
