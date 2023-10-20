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

/* eslint-disable @lwc/lwc/no-async-await */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable es/no-optional-chaining */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator');
const exec = promisify(require('child_process').exec);

const fsPromises = fs.promises;

function isFunctionComponent(ast) {
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
        FunctionDeclaration({node}) {
            functionNames.add(node.id?.name);
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

function isClassComponent(ast) {
    let hasReactImport = false;
    let hasClassComponentDeclaration = false;
    traverse.default(ast, {
        ImportDeclaration({node}) {
            const source = node.source.value;
            if (source === 'react') {
                hasReactImport = true;
            }
        },
        ClassDeclaration({node}) {
            if (!node.superClass || (node.superClass.name !== 'Component' && node.superClass.name !== 'React.Component')) {
                return;
            }
            hasClassComponentDeclaration = true;
        },
    });
    return hasReactImport && hasClassComponentDeclaration;
}

async function writeASTToFile(filePath, fileContents, ast) {
    // Generate the modified code from the AST
    const modifiedCode = generate.default(ast, {compact: false, retainLines: true, retainFunctionParens: true}, fileContents).code;

    // Replace the contents of the file with the new code
    await fs.writeFile(filePath, modifiedCode, {encoding: 'utf8'}, () => {});
}

async function migrateStylesForClassComponent(filePath, fileContents, ast) {
    const relativePathToStylesDir = path.relative(path.dirname(filePath), '/Users/roryabraham/Expensidev/App/src/styles');
    let didAddWithThemeHOC = false;
    let didAddWithThemeColorsHOC = false;

    // Swap out static style/theme imports for HOC imports
    traverse.default(ast, {
        ImportDeclaration({node}) {
            const source = node.source.value;
            if (source === `${relativePathToStylesDir}/styles`) {
                node.specifiers[0].local.name = 'withTheme';
                node.specifiers.push({
                    type: 'ImportSpecifier',
                    imported: {
                        type: 'Identifier',
                        name: 'withThemePropTypes',
                    },
                });
                node.source.value = `${relativePathToStylesDir}/withTheme`;
                didAddWithThemeHOC = true;
            }
            if (source === `${relativePathToStylesDir}/themes/default`) {
                node.specifiers[0].local.name = 'withThemeColors';
                node.specifiers.push({
                    type: 'ImportSpecifier',
                    imported: {
                        type: 'Identifier',
                        name: 'withThemeColorPropTypes',
                    },
                });
                node.source.value = `${relativePathToStylesDir}/withThemeColors`;
                didAddWithThemeColorsHOC = true;
            }
        },
    });

    // Add new propTypes
    traverse.default(ast, {
        VariableDeclarator({node}) {
            if (node.id.name !== 'propTypes') {
                return;
            }

            if (didAddWithThemeHOC) {
                node.init.properties.push({type: 'SpreadElement', argument: {type: 'Identifier', name: 'withThemePropTypes'}});
            }

            if (didAddWithThemeColorsHOC) {
                node.init.properties.push({type: 'SpreadElement', argument: {type: 'Identifier', name: 'withThemeColorPropTypes'}});
            }
        },
    });

    writeASTToFile(filePath, fileContents, ast);
}

async function migrateStylesForFunctionComponent(filePath, fileContents, ast) {
    const relativePathToStylesDir = path.relative(path.dirname(filePath), '/Users/roryabraham/Expensidev/App/src/styles');
    traverse.default(ast, {
        ImportDeclaration({node}) {
            const source = node.source.value;
            if (source === `${relativePathToStylesDir}/styles`) {
                node.specifiers[0].local.name = 'useThemeStyles';
                node.source.value = `${relativePathToStylesDir}/useThemeStyles`;
            }
            if (source === `${relativePathToStylesDir}/themes/default`) {
                node.specifiers[0].local.name = 'useTheme';
                node.source.value = `${relativePathToStylesDir}/useTheme`;
            }
        },
    });

    writeASTToFile(filePath, fileContents, ast);
}

async function migrateStaticStylesForFile(filePath) {
    const fileContents = await fsPromises.readFile(filePath, 'utf8');
    const ast = parser.parse(fileContents, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'], // Enable JSX and TSX parsing
    });

    console.log('Parsing file:', filePath);
    if (isFunctionComponent(ast)) {
        console.log('File contains function component', filePath);
        migrateStylesForFunctionComponent(filePath, fileContents, ast);
    } else if (isClassComponent(ast)) {
        console.log('File contains class component', filePath);
        migrateStylesForClassComponent(filePath, fileContents, ast);
    }
}

async function migrateStaticStylesForDirectory(directoryPath) {
    const files = await fsPromises.readdir(directoryPath);
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stat = await fsPromises.stat(filePath);

        if (stat.isDirectory()) {
            await migrateStaticStylesForDirectory(filePath);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx'))) {
            await migrateStaticStylesForFile(filePath);
        }
    }
}

async function run() {
    // Usage
    const directoryPath = process.argv[2]; // Get the directory path from command line arguments

    if (!directoryPath) {
        console.error('Usage: node script.js <directory_path>');
    } else {
        try {
            await migrateStaticStylesForDirectory(directoryPath);
            await exec('npm run prettier');
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

run();
