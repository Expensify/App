#!/usr/bin/env node

/**
 * Check React Compiler optimization status for a file and its imported components.
 *
 * Usage: node checkReactCompilerOptimization.js <file-path>
 * Output: JSON with component names and their optimization status
 */

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Load tsconfig once
const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const {options} = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
const host = ts.createCompilerHost(options);

/**
 * Resolve module path using TypeScript (respects tsconfig paths).
 */
function resolveModule(moduleName, fromFile) {
    const result = ts.resolveModuleName(moduleName, fromFile, options, host);
    return result.resolvedModule?.resolvedFileName || null;
}

/**
 * Extract import paths from file using regex.
 */
function getImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    const regex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const [, defaultImport, namedImports, modulePath] = match;

        // Skip external packages (react, react-native, lodash, etc.)
        if (!modulePath.startsWith('@') && !modulePath.startsWith('.')) continue;

        if (defaultImport) {
            imports.push({name: defaultImport, module: modulePath});
        }

        if (namedImports) {
            namedImports.split(',').forEach((n) => {
                const name = n.trim().split(/\s+as\s+/).pop().trim();
                if (name && !name.startsWith('type ')) {
                    imports.push({name, module: modulePath});
                }
            });
        }
    }

    return imports;
}

/**
 * Run react-compiler-healthcheck and parse output.
 */
function runHealthcheck(fileNames) {
    if (!fileNames.length) return {optimized: new Set(), failed: new Map()};

    const glob = `**/+(${fileNames.join('|')})`;

    try {
        const output = execSync(`npx react-compiler-healthcheck --src '${glob}' --verbose 2>&1`, {
            encoding: 'utf8',
            timeout: 60000,
        });
        return parseOutput(output);
    } catch (e) {
        return parseOutput(e.stdout || e.message || '');
    }
}

/**
 * Parse healthcheck verbose output.
 */
function parseOutput(output) {
    const optimized = new Set();

    for (const line of output.split('\n')) {
        // Success: Successfully compiled component [Name](path)
        const success = line.match(/Successfully compiled (?:hook|component) \[([^\]]+)\]/);
        if (success) {
            optimized.add(success[1]);
        }
    }

    return {optimized};
}

// Main
const inputFile = process.argv[2];
if (!inputFile || !fs.existsSync(inputFile)) {
    console.error('Usage: node checkReactCompilerOptimization.js <file-path>');
    process.exit(1);
}

const imports = getImports(inputFile);
const filesToCheck = new Set([path.basename(inputFile)]);
const importToResolved = new Map();

for (const imp of imports) {
    const resolved = resolveModule(imp.module, inputFile);
    if (resolved?.endsWith('.tsx')) {
        const fileName = path.basename(resolved);
        filesToCheck.add(fileName);
        importToResolved.set(imp.name, resolved);
    }
}

const {optimized} = runHealthcheck([...filesToCheck]);

// Extract component/hook name from the input file
const inputFileContent = fs.readFileSync(inputFile, 'utf8');

// Try to find the exported component/hook name
let inputComponentName = null;

// Priority order:
// 1. displayName (most reliable for components)
const displayNameMatch = inputFileContent.match(/(\w+)\.displayName\s*=\s*['"](\w+)['"]/);
// 2. export default function Name(
const exportDefaultFunctionMatch = inputFileContent.match(/export\s+default\s+function\s+(\w+)\s*\(/);
// 3. export default Name (for memo-wrapped or direct exports)
const exportDefaultMatch = inputFileContent.match(/export\s+default\s+(?:React\.)?(?:memo|forwardRef)?\s*\(?\s*(\w+)/);
// 4. function Name( that's later exported (fallback)
const functionMatch = inputFileContent.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);

if (displayNameMatch) {
    // Use the component name from displayName (first capture group is the variable, second is the string value)
    inputComponentName = displayNameMatch[2] || displayNameMatch[1];
} else if (exportDefaultFunctionMatch) {
    inputComponentName = exportDefaultFunctionMatch[1];
} else if (exportDefaultMatch) {
    inputComponentName = exportDefaultMatch[1];
} else if (functionMatch) {
    inputComponentName = functionMatch[1];
}

const result = {};

// Add the input file (parent) to result first
if (inputComponentName) {
    result[`${inputComponentName} (this file)`] = {
        optimized: optimized.has(inputComponentName),
        path: path.resolve(inputFile),
    };
}

// Add imported components (children)
for (const imp of imports) {
    const resolvedPath = importToResolved.get(imp.name);
    if (resolvedPath) {
        result[imp.name] = {
            optimized: optimized.has(imp.name),
            path: resolvedPath,
        };
    }
}

console.log(JSON.stringify(result, null, 2));
