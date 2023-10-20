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

const fs = require('fs').promises;
const path = require('path');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator');

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
    await fs.writeFile(filePath, modifiedCode, {encoding: 'utf8'});
}

async function migrateStylesForClassComponent(filePath, fileContents, ast) {
    const relativePathToStylesDir = path.relative(path.dirname(filePath), '/Users/roryabraham/Expensidev/App/src/styles');
    let styleIdentifier = '';
    let themeColorsIdentifier = '';

    // Swap out static style/theme imports for HOC imports
    traverse.default(ast, {
        ImportDeclaration({node}) {
            const source = node.source.value;
            if (source === `${relativePathToStylesDir}/styles`) {
                styleIdentifier = node.specifiers[0].local.name;
                node.specifiers[0].local.name = 'withTheme';
                node.specifiers.push({
                    type: 'ImportSpecifier',
                    imported: {
                        type: 'Identifier',
                        name: 'withThemePropTypes',
                    },
                });
                node.source.value = `${relativePathToStylesDir}/withTheme`;
            }
            if (source === `${relativePathToStylesDir}/themes/default`) {
                themeColorsIdentifier = node.specifiers[0].local.name;
                node.specifiers[0].local.name = 'withThemeColors';
                node.specifiers.push({
                    type: 'ImportSpecifier',
                    imported: {
                        type: 'Identifier',
                        name: 'withThemeColorPropTypes',
                    },
                });
                node.source.value = `${relativePathToStylesDir}/withThemeColors`;
            }
        },
    });

    traverse.default(ast, {
        VariableDeclarator({node}) {
            if (node.id.name !== 'propTypes') {
                return;
            }

            if (styleIdentifier) {
                node.init.properties.push({type: 'SpreadElement', argument: {type: 'Identifier', name: 'withThemePropTypes'}});
            }

            if (themeColorsIdentifier) {
                node.init.properties.push({type: 'SpreadElement', argument: {type: 'Identifier', name: 'withThemeColorPropTypes'}});
            }
        },
        MemberExpression({node}) {
            if (styleIdentifier && node.object.name === styleIdentifier) {
                node.object = {
                    type: 'MemberExpression',
                    object: {
                        type: 'MemberExpression',
                        object: {
                            type: 'ThisExpression',
                        },
                        property: {
                            type: 'Identifier',
                            name: 'props',
                        },
                    },
                    property: {
                        type: 'Identifier',
                        name: 'themeStyles',
                    },
                };
            }
            if (styleIdentifier && node.object.name === themeColorsIdentifier) {
                node.object = {
                    type: 'MemberExpression',
                    object: {
                        type: 'MemberExpression',
                        object: {
                            type: 'ThisExpression',
                        },
                        property: {
                            type: 'Identifier',
                            name: 'props',
                        },
                    },
                    property: {
                        type: 'Identifier',
                        name: 'theme',
                    },
                };
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
    const fileContents = await fs.readFile(filePath, 'utf8');
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
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            await migrateStaticStylesForDirectory(filePath);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx'))) {
            await migrateStaticStylesForFile(filePath);
        }
    }
}

/**
 * If the diff includes any lines that are just whitespace, undo them.
 * Sometimes blank lines are added in weird places by babel's generator due to the retainLines flag,
 * which is necessary to keep the formatting from the original source as much as possible.
 *
 * @returns {Promise<void>}
 */
// async function stripBlankLinesFromDiff() {
//     try {
//         const {stdout} = await exec("git diff --unified=0 -- ':!scripts/codemods/MigrateStaticStylesToThemeHooks.js'");
//
//         console.log('RORY_DEBUG diff', stdout);
//
//         // Process the diff output to remove blank lines from added content
//         let currentFile = '';
//         let lineNumber = 1; // the line number from the source file, not the diff
//         const linesToDelete = new Map();
//         for (const line of stdout.split('\n')) {
//             // Get the filename from the diff line
//             const currentFileMatch = line.match(/b\/(.+)/) || [];
//             if (currentFileMatch && currentFileMatch.length) {
//                 currentFile = currentFileMatch[1];
//                 console.log('RORY_DEBUG setting currentFile', currentFile);
//             }
//
//             const [, hunkStartNumber] = line.match(/@@ -\d+,\d+ \+(\d+),?/) || [];
//
//             if (hunkStartNumber) {
//                 lineNumber = hunkStartNumber;
//                 console.log('RORY_DEBUG setting lineNumber to', lineNumber);
//             }
//
//             if (line.replace('+', '').trim() === '') {
//                 console.log(`Adding currentFile ${currentFile} to linesToDelete map`, lineNumber);
//                 const prevLinesToDelete = linesToDelete.get(currentFile) || new Set();
//                 prevLinesToDelete.add(lineNumber);
//                 linesToDelete.set(currentFile, prevLinesToDelete);
//             }
//
//             if (line.startsWith('+')) {
//                 lineNumber++;
//                 console.log('RORY_DEBUG setting lineNumber to', lineNumber);
//             }
//         }
//
//         for (const [fileToModify] of linesToDelete) {
//             // Read the content of the file
//             console.log('RORY_DEBUG reading fileToModify', fileToModify);
//             const fileContent = await fs.readFile(fileToModify, {encoding: 'utf8'});
//             let modifiedContent = '';
//             const lines = fileContent.split('\n');
//             for (let lineNum = 1; lineNum < lines.length + 1; lineNum++) {
//                 if (!linesToDelete.get(fileToModify).has(lineNum)) {
//                     modifiedContent += lines[lineNum - 1];
//                     modifiedContent += '\n';
//                 }
//             }
//
//             // Write the modified content back to the file
//             await fs.writeFile(fileToModify, modifiedContent, 'utf8');
//         }
//
//         console.log('Blank lines removed from added content.');
//     } catch (error) {
//         console.error(`Error running 'git diff' or processing files: ${error}`);
//     }
// }

/**
 * If the diff includes any lines that are just whitespace, undo them.
 * Sometimes blank lines are added in weird places by babel's generator due to the retainLines flag,
 * which is necessary to keep the formatting from the original source as much as possible.
 *
 * @returns {Promise<void>}
 */
async function stripBlankLinesFromDiff() {
    try {
        const {stdout} = await exec("git diff --unified=0 -- ':!scripts/codemods/MigrateStaticStylesToThemeHooks.js'");
        console.log('RORY_DEBUG original diff', stdout);
        const modifiedDiff = [];
        const lines = stdout.split('\n');
        for (const line of lines) {
            // A lonely plus in the diff means we added a blank line
            if (line && line.replace('+', '').trim() === '') {
                // Remove the previous line, which will be a hunk marker line, and don't include the lonely plus
                modifiedDiff.pop();
            } else {
                modifiedDiff.push(line);
            }
        }
        // for (let i = 0; i < lines.length; i++) {
        //     const line = lines[i];
        //     if (line && line.replace('+', '').trim() === '') {
        //         // Remove the previous line, which will be a hunk marker line
        //         modifiedDiff.pop();
        //     } else {
        //         modifiedDiff[i] = `${line}`;
        //     }
        // }
        console.log('RORY_DEBUG have modifiedDiff', modifiedDiff.join('\n'));
        await exec('git restore src/components/Button/index.js');
        await exec(`echo "${modifiedDiff.join('\n')}" | git apply --recount -`);
    } catch (error) {
        console.error('Error stripping blank lines from diff', error);
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
            console.log('Running prettier...');
            await exec('npm run prettier');
            await stripBlankLinesFromDiff();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

run();
