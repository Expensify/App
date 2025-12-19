#!/usr/bin/env node

/**
 * Check React Compiler optimization status for a file and its imported components.
 *
 * Usage: node checkReactCompilerOptimization.js <file-path>
 * Output: JSON with optimization status for parent and all imported children
 */

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Load tsconfig once
const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const {options} = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

/**
 * Find platform variants for a resolved file path.
 * E.g., for index.tsx, find index.native.tsx, index.ios.tsx, etc.
 */
function findPlatformVariants(resolvedPath) {
    const dir = path.dirname(resolvedPath);
    const basename = path.basename(resolvedPath);
    const variants = [];

    // Platform suffixes to check
    const platforms = ['native', 'ios', 'android', 'web', 'desktop'];

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
function getImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const standardImports = [];
    const namespaceImports = [];

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
                const originalName = parts[0].trim();
                const aliasName = parts.length > 1 ? parts[1].trim() : originalName;
                if (originalName && !originalName.startsWith('type ')) {
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
function findNamespaceUsage(content, namespaceName) {
    const usedMembers = new Set();
    // Match Namespace.MemberName where MemberName starts with capital letter (component)
    const usageRegex = new RegExp(`${namespaceName}\\.([A-Z]\\w+)`, 'g');

    for (const match of content.matchAll(usageRegex)) {
        usedMembers.add(match[1]);
    }

    return [...usedMembers];
}

/**
 * Resolve import to actual source file using TypeChecker.
 * This follows re-exports to find the real file where the component is defined.
 * For default imports, also resolves the actual exported name.
 */
function resolveImportToSourceFile(program, checker, fromFile, modulePath, exportName, isDefault) {
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
            const defaultExport = moduleSymbol.exports?.get('default');
            if (defaultExport) {
                const aliasedSymbol = checker.getAliasedSymbol(defaultExport);
                const actualName = aliasedSymbol.getName();
                // Also check if it's re-exported from another file
                const declarations = aliasedSymbol.getDeclarations();
                if (declarations && declarations.length > 0) {
                    const actualSourceFile = declarations[0].getSourceFile();
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

        if (declarations && declarations.length > 0) {
            const actualSourceFile = declarations[0].getSourceFile();
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
function runHealthcheck(filePaths) {
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
    } catch (e) {
        output = e.stdout || e.message || '';
    }

    return parseOutput(output);
}

/**
 * Parse healthcheck verbose output.
 * Returns Map<path, Set<componentNames>>
 */
function parseOutput(output) {
    const results = new Map();

    for (const line of output.split('\n')) {
        // Success: Successfully compiled component [Name](path)
        const success = line.match(/Successfully compiled (?:hook|component) \[([^\]]+)\]\(([^)]+)\)/);
        if (success) {
            const [, componentName, filePath] = success;
            const absolutePath = path.resolve(filePath);

            if (!results.has(absolutePath)) {
                results.set(absolutePath, new Set());
            }
            results.get(absolutePath).add(componentName);
        }
    }

    return results;
}

// Main
const inputFile = process.argv[2];
if (!inputFile || !fs.existsSync(inputFile)) {
    console.error('Usage: node checkReactCompilerOptimization.js <file-path>');
    process.exit(1);
}

const absoluteInputFile = path.resolve(inputFile);
const fileContent = fs.readFileSync(absoluteInputFile, 'utf8');
const {standardImports, namespaceImports} = getImports(absoluteInputFile);

// Create TypeScript program for symbol resolution
const program = ts.createProgram([absoluteInputFile], options);
const checker = program.getTypeChecker();

// Collect all files to check (including platform variants)
const allFilesToCheck = new Set();
const importDataMap = new Map(); // usedAs -> {usedAs, originalName, variants}

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
const parentOptimizedSet = optimizationResults.get(absoluteInputFile) || new Set();
const parentOptimized = [...parentOptimizedSet];

// Build output
const result = {
    parentOptimized,
    childComponents: {},
};

// Add child components with their variants (simplified to boolean)
for (const [usedAs, data] of importDataMap) {
    result.childComponents[usedAs] = {
        variants: data.variants.map((variant) => {
            const optimizedSet = optimizationResults.get(variant.path) || new Set();
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
