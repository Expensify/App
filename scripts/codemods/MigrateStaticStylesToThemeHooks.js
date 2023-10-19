#!/usr/bin/env node

/*
 * This file contains a script that performs a code modification (codemod) to migrate all our static files to use the new theme hooks instead.
 * An example PR containing the migration for a few components can be found here: https://github.com/Expensify/App/pull/27346/files
 *
 * At a high level, the input to this script is a directory, and it will then:
 *
 * - Iterate through the JS/TS files in that directory
 * - If a file contains a React component, look for any uses of styles or theme colors
 * - Import the new theme and style hooks useTheme and useThemeStyles
 * - Use the hook or HOC in the component
 * - Replace the usages of the old static styles with a hook
 * - Remove the unused import of the old static styles
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');

const fsPromises = fs.promises;

// Function to check if a JavaScript file contains a React component (Class or Functional)
function containsReactComponent(fileContent) {
    const ast = parser.parse(fileContent, {
        sourceType: 'module',
        plugins: ['jsx'], // Enable JSX parsing
    });

    let hasReactImport = false;
    let hasReactComponent = false;
    const functionNames = new Set();

    traverse.default(ast, {
        ImportDeclaration({node}) {
            const source = node.source.value;
            if (source === 'react') {
                hasReactImport = true;
            }
        },
        ClassDeclaration({node}) {
            if (node.superClass && node.superClass.name === 'Component') {
                hasReactComponent = true;
            }
        },
        FunctionDeclaration({node}) {
            functionNames.add(node.id?.name);
            if (node.params.length === 1 && node.params[0].name === 'props') {
                hasReactComponent = true;
            }
        },
        ExpressionStatement({node}) {
            const expression = node.expression;
            if (expression.type === 'AssignmentExpression' && functionNames.has(expression.left.object?.name) && expression.left.property?.name === 'displayName') {
                hasReactComponent = true;
            }
        },
    });

    return hasReactImport && hasReactComponent;
}

// Function to recursively find JavaScript files with React components
async function findReactComponents(directoryPath) {
    const files = await fsPromises.readdir(directoryPath);

    const jsFilesWithReactComponents = [];

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stat = await fsPromises.stat(filePath);

        if (stat.isDirectory()) {
            // Recursively search subdirectories
            jsFilesWithReactComponents.push(...(await findReactComponents(filePath)));
        } else if ((stat.isFile() && file.endsWith('.js')) || file.endsWith('.jsx')) {
            // Check if the file contains a React component
            const fileContent = await fsPromises.readFile(filePath, 'utf8');
            // console.log('RORY_DEBUG file and fileContent:', filePath, fileContent);
            if (containsReactComponent(fileContent)) {
                jsFilesWithReactComponents.push(filePath);
            }
        }
    }

    return jsFilesWithReactComponents;
}

// Usage
const directoryPath = process.argv[2]; // Get the directory path from command line arguments

if (!directoryPath) {
    console.error('Usage: node script.js <directory_path>');
} else {
    findReactComponents(directoryPath)
        .then((jsFilesWithReactComponents) => {
            console.log('JavaScript files with React components:');
            jsFilesWithReactComponents.forEach((filePath) => {
                console.log(filePath);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
