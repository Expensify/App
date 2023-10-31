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
/* eslint-disable rulesdir/prefer-underscore-method */

const fs = require('fs').promises;
const path = require('path');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator');

function getComponentInfo(ast) {
    let componentInfo = {};
    const functionNames = new Set();
    traverse.default(ast, {
        FunctionDeclaration({node}) {
            functionNames.add(node.id?.name);
        },
        VariableDeclaration({node}) {
            if (node.declarations[0].init?.callee?.name !== 'forwardRef' && node.declarations[0].init?.property?.name !== 'forwardRef') {
                return;
            }
            functionNames.add(node.declarations[0].id.name);
        },
        ExpressionStatement({node}) {
            const expression = node.expression;
            if (expression.type === 'AssignmentExpression' && functionNames.has(expression.left.object?.name) && expression.left.property?.name === 'displayName') {
                componentInfo = {
                    name: expression.left.object.name,
                    isClassComponent: false,
                };
            }
        },
        ClassDeclaration({node}) {
            if (!node.superClass || !['Component', 'React.Component', 'PureComponent', 'React.PureComponent'].includes(node.superClass.name)) {
                return;
            }
            componentInfo = {
                name: node.id.name,
                isClassComponent: true,
            };
        },
    });
    return componentInfo;
}

async function writeASTToFile(filePath, fileContents, ast) {
    // Generate the modified code from the AST
    const modifiedCode = generate.default(ast, {compact: false, retainLines: true, retainFunctionParens: true}, fileContents).code;

    // Replace the contents of the file with the new code
    await fs.writeFile(filePath, modifiedCode, {encoding: 'utf8'});
}

function addComposeImport(filePath, ast) {
    const relativePathToLibsDir = path.relative(path.dirname(filePath), '/Users/roryabraham/Expensidev/App/src/libs');
    const hasComposeImport = ast.program.body.find((node) => node.type === 'ImportDeclaration' && node.specifiers[0].local.name === 'compose');
    if (hasComposeImport) {
        return;
    }

    const lastImportIndex = ast.program.body.findLastIndex((node) => node.type === 'ImportDeclaration');
    ast.program.body.splice(lastImportIndex + 1, 0, {
        type: 'ImportDeclaration',
        specifiers: [
            {
                type: 'ImportDefaultSpecifier',
                local: {
                    type: 'Identifier',
                    name: 'compose',
                },
            },
        ],
        source: {
            type: 'StringLiteral',
            value: `${relativePathToLibsDir}/compose`,
        },
    });
}

async function migrateStylesForClassComponent(filePath, fileContents, ast) {
    const relativePathToStylesDir = path.relative(path.dirname(filePath), '/Users/roryabraham/Expensidev/App/src/styles');
    const relativePathToComponentsDir = path.relative(path.dirname(filePath), '/Users/roryabraham/Expensidev/App/src/components');
    let styleIdentifier = '';
    let themeColorsIdentifier = '';

    // Swap out static style/theme imports for HOC imports
    traverse.default(ast, {
        ImportDeclaration({node}) {
            const source = node.source.value;
            if (source === `${relativePathToStylesDir}/styles` || source === '@styles/styles') {
                styleIdentifier = node.specifiers[0].local.name;
                node.specifiers[0].local.name = 'withThemeStyles';
                node.specifiers.push({
                    type: 'ImportSpecifier',
                    imported: {
                        type: 'Identifier',
                        name: 'withThemeStylesPropTypes',
                    },
                });
                node.source.value = `${relativePathToComponentsDir}/withThemeStyles`;
            }
            if (source === `${relativePathToStylesDir}/themes/default` || source === '@styles/themes/default') {
                themeColorsIdentifier = node.specifiers[0].local.name;
                node.specifiers[0].local.name = 'withTheme';
                node.specifiers.push({
                    type: 'ImportSpecifier',
                    imported: {
                        type: 'Identifier',
                        name: 'withThemePropTypes',
                    },
                });
                node.source.value = `${relativePathToComponentsDir}/withTheme`;
            }
        },
        VariableDeclarator({node}) {
            if (node.id.name !== 'propTypes') {
                return;
            }

            if (styleIdentifier) {
                node.init.properties.push({type: 'SpreadElement', argument: {type: 'Identifier', name: 'withThemeStylesPropTypes'}});
            }

            if (themeColorsIdentifier) {
                node.init.properties.push({type: 'SpreadElement', argument: {type: 'Identifier', name: 'withThemePropTypes'}});
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
        ExportDefaultDeclaration({node}) {
            const newHOCs = [];
            if (styleIdentifier) {
                newHOCs.push({
                    type: 'Identifier',
                    name: 'withThemeStyles',
                });
            }
            if (themeColorsIdentifier) {
                newHOCs.push({
                    type: 'Identifier',
                    name: 'withTheme',
                });
            }

            if (newHOCs.length === 0) {
                return;
            }

            if (node.declaration.type === 'Identifier') {
                const prevDeclaration = node.declaration;
                if (newHOCs.length === 1) {
                    node.declaration = {
                        type: 'CallExpression',
                        callee: newHOCs[0],
                        arguments: [prevDeclaration],
                    };
                } else {
                    node.declaration = {
                        type: 'CallExpression',
                        callee: {
                            type: 'CallExpression',
                            callee: {
                                type: 'Identifier',
                                name: 'compose',
                            },
                            arguments: newHOCs,
                        },
                        arguments: [prevDeclaration],
                    };
                    addComposeImport(filePath, ast);
                }
                return;
            }

            // Export is wrapped with composed HOCs
            if (node.declaration.callee?.callee?.name === 'compose') {
                node.declaration.callee.arguments = node.declaration.callee.arguments.concat(newHOCs);
                return;
            }

            // Export is wrapped with a single HOC
            const previousHOC = node.declaration.callee?.callee || node.declaration.callee;
            if (previousHOC.name?.startsWith('with')) {
                node.declaration.callee = {
                    type: 'CallExpression',
                    callee: {
                        type: 'Identifier',
                        name: 'compose',
                    },
                    arguments: [
                        {
                            type: previousHOC.type,
                            name: previousHOC.name,
                        },
                        ...newHOCs,
                    ],
                };
                addComposeImport(filePath, ast);
            }

            // Export is another function, most probably React.forwardRef
            const prevDeclaration = node.declaration;
            if (newHOCs.length === 1) {
                node.declaration = {
                    type: 'CallExpression',
                    callee: newHOCs[0],
                    arguments: [prevDeclaration],
                };
            } else {
                node.declaration = {
                    type: 'CallExpression',
                    callee: {
                        type: 'CallExpression',
                        callee: {
                            type: 'Identifier',
                            name: 'compose',
                        },
                        arguments: newHOCs,
                    },
                    arguments: [prevDeclaration],
                };
                addComposeImport(filePath, ast);
            }
        },
    });

    writeASTToFile(filePath, fileContents, ast);
}

async function migrateStylesForFunctionComponent(filePath, fileContents, ast, componentName) {
    const relativePathToStylesDir = path.relative(path.dirname(filePath), '/Users/roryabraham/Expensidev/App/src/styles');
    let styleIdentifier = '';
    let themeColorsIdentifier = '';
    traverse.default(ast, {
        ImportDeclaration({node}) {
            const source = node.source.value;
            if (source === `${relativePathToStylesDir}/styles` || source === '@styles/styles') {
                styleIdentifier = node.specifiers[0].local.name;
                node.specifiers[0].local.name = 'useThemeStyles';
                node.source.value = `${relativePathToStylesDir}/useThemeStyles`;
            }
            if (source === `${relativePathToStylesDir}/themes/default` || source === '@styles/themes/default') {
                themeColorsIdentifier = node.specifiers[0].local.name;
                node.specifiers[0].local.name = 'useTheme';
                node.source.value = `${relativePathToStylesDir}/themes/useTheme`;
            }
        },
        VariableDeclaration({node}) {
            if (node.declarations[0].init?.callee?.property?.name === 'forwardRef' || node.declarations[0].init?.callee?.name === 'forwardRef') {
                if (styleIdentifier) {
                    node.declarations[0].init.arguments[0].body.body.unshift({
                        type: 'VariableDeclaration',
                        kind: 'const',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'styles',
                                },
                                init: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'Identifier',
                                        name: 'useThemeStyles',
                                    },
                                    arguments: [],
                                },
                            },
                        ],
                    });
                }
                if (themeColorsIdentifier) {
                    node.declarations[0].init.arguments[0].body.body.unshift({
                        type: 'VariableDeclaration',
                        kind: 'const',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'theme',
                                },
                                init: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'Identifier',
                                        name: 'useTheme',
                                    },
                                    arguments: [],
                                },
                            },
                        ],
                    });
                }
            }
        },
        FunctionDeclaration({node}) {
            if (node.id?.name !== componentName) {
                return;
            }
            if (styleIdentifier) {
                node.body.body.unshift({
                    type: 'VariableDeclaration',
                    kind: 'const',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'styles',
                            },
                            init: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'useThemeStyles',
                                },
                                arguments: [],
                            },
                        },
                    ],
                });
            }
            if (themeColorsIdentifier) {
                node.body.body.unshift({
                    type: 'VariableDeclaration',
                    kind: 'const',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'theme',
                            },
                            init: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'useTheme',
                                },
                                arguments: [],
                            },
                        },
                    ],
                });
            }
        },
        MemberExpression({node}) {
            if (!themeColorsIdentifier || node.object.name !== themeColorsIdentifier) {
                return;
            }
            node.object.name = 'theme';
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
    const {name: componentName, isClassComponent} = getComponentInfo(ast);

    if (!componentName) {
        return;
    }

    if (isClassComponent) {
        console.log('File contains class component', filePath);
        migrateStylesForClassComponent(filePath, fileContents, ast);
        return;
    }

    console.log('File contains function component', filePath);
    migrateStylesForFunctionComponent(filePath, fileContents, ast, componentName);
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
 * @param {String} directoryPath
 * @returns {Promise<void>}
 */
async function stripBlankLinesFromDiff(directoryPath) {
    try {
        console.log('Stripping blank lines from diff...');
        await exec("git diff --ignore-blank-lines -- ':!scripts/codemods/MigrateStaticStylesToThemeHooks.js' > tmp.patch");
        await exec(`git restore ${directoryPath}`);
        await exec(`git apply -v tmp.patch`);
        await exec('rm tmp.patch');
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
            // await migrateStaticStylesForFile('/Users/roryabraham/Expensidev/App/src/components/AnchorForCommentsOnly/BaseAnchorForCommentsOnly.js');
            console.log('Running prettier...');
            await exec("npx prettier --write $(git diff --name-only --diff-filter d | grep -E '\\.js|\\.tsx$' | xargs)");
            // await exec('npm run lint-changed');
            await stripBlankLinesFromDiff(directoryPath);
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

run();
