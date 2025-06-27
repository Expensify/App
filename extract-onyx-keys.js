#!/usr/bin/env node

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

/**
 * Recursively get all JavaScript/TypeScript files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    let filesList = [...arrayOfFiles];

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            filesList = getAllFiles(fullPath, filesList);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            filesList.push(fullPath);
        }
    });

    return filesList;
}

/**
 * Extract Onyx.connect calls and their key properties from file content
 */
function extractOnyxKeys(content) {
    const results = [];

        // Look for Onyx.connect( patterns
    const onyxConnectRegex = /Onyx\.connect\s*\(/g;
    let match = onyxConnectRegex.exec(content);

    while (match !== null) {
        const startIndex = match.index;
        const openParenIndex = startIndex + match[0].length - 1;

        // Find the matching closing parenthesis
        let parenCount = 1;
        let endIndex = openParenIndex + 1;

        while (endIndex < content.length && parenCount > 0) {
            if (content[endIndex] === '(') {
                parenCount++;
            } else if (content[endIndex] === ')') {
                parenCount--;
            }
            endIndex++;
        }

        if (parenCount === 0) {
            // Extract the content inside the parentheses
            const connectContent = content.substring(openParenIndex + 1, endIndex - 1);

            // Extract the key property
            const key = extractKeyProperty(connectContent);

            if (key) {
                // Get line number for better reporting
                const beforeConnect = content.substring(0, startIndex);
                const lineNumber = (beforeConnect.match(/\n/g) || []).length + 1;

                results.push({
                    key,
                    line: lineNumber,
                    context: connectContent.trim().substring(0, 100) + (connectContent.length > 100 ? '...' : '')
                });
            }
        }

        match = onyxConnectRegex.exec(content);
    }

    return results;
}

/**
 * Extract the key property from the Onyx.connect object parameter
 */
function extractKeyProperty(connectContent) {
    // Remove comments
    const cleanContent = connectContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    // Look for key property patterns
    const keyPatterns = [
        // key: ONYXKEYS.SOMETHING
        /key\s*:\s*([A-Z_][A-Z0-9_.]*)/,
        // key: 'string'
        /key\s*:\s*['"`]([^'"`]+)['"`]/,
        // key: `template string`
        /key\s*:\s*`([^`]+)`/
    ];

    for (const pattern of keyPatterns) {
        const match = cleanContent.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    // Handle more complex cases where key might be computed
    const complexKeyMatch = cleanContent.match(/key\s*:\s*([^,\n}]+)/);
    if (complexKeyMatch) {
        return complexKeyMatch[1].trim();
    }

    return null;
}

/**
 * Main function to scan directory and extract Onyx keys
 */
function main() {
    const srcDir = path.join(process.cwd(), 'src');

    if (!fs.existsSync(srcDir)) {
        console.error('Error: src directory not found');
        process.exit(1);
    }

    console.log('🔍 Scanning for Onyx.connect() calls in src directory...\n');

    const files = getAllFiles(srcDir);
    const results = {};
    let totalConnections = 0;

    files.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const keys = extractOnyxKeys(content, filePath);

            if (keys.length > 0) {
                const relativePath = path.relative(process.cwd(), filePath);
                results[relativePath] = keys;
                totalConnections += keys.length;
            }
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error.message);
        }
    });

    // Display results
    console.log(`📊 Found ${totalConnections} Onyx.connect() calls in ${Object.keys(results).length} files\n`);

    Object.keys(results).sort().forEach(filePath => {
        console.log(`***${filePath}`);
        results[filePath].forEach(result => {
            console.log(`>>> Line ${result.line}: ${result.key}`);
        });
        console.log('');
    });

    // Summary of unique keys
    const allKeys = [];
    Object.values(results).forEach(fileResults => {
        fileResults.forEach(result => {
            allKeys.push(result.key);
        });
    });

    const uniqueKeys = [...new Set(allKeys)].sort();
    console.log(`\n📋 Summary: ${uniqueKeys.length} unique keys found:`);
    uniqueKeys.forEach(key => {
        const count = allKeys.filter(k => k === key).length;
        console.log(`   • ${key} (used ${count} time${count > 1 ? 's' : ''})`);
    });
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    getAllFiles,
    extractOnyxKeys,
    extractKeyProperty
};
