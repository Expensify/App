#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

/* eslint-disable @lwc/lwc/no-async-await */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable es/no-optional-chaining */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable rulesdir/prefer-underscore-method */
/* eslint-disable no-continue */

const APP_DIR = '/Users/roryabraham/Expensidev/App';

async function writeASTToFile(filePath, fileContents, ast) {
    // Generate the modified code from the AST
    const modifiedCode = generate.default(ast, {compact: false, retainLines: true, retainFunctionParens: true}, fileContents).code;

    // Replace the contents of the file with the new code
    await fs.writeFile(filePath, modifiedCode, {encoding: 'utf8'});
}

async function migrateFile(filePath) {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const ast = parser.parse(fileContents, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'], // Enable JSX and TSX parsing
    });

    console.log('Parsing file:', filePath);

    traverse.default(ast, {
        ClassDeclaration({node}) {
            if (!node.superClass) {
                return;
            }
            if (node.superClass.type !== 'MemberExpression') {
                return;
            }
            if (node.superClass.object.name !== 'React') {
                return;
            }
            const superClass = node.superClass.property.name;
            for (const n of ast.program.body) {
                if (n.type !== 'ImportDeclaration' || n.specifiers[0].local.name !== 'React') {
                    continue;
                }
                n.specifiers.push({
                    type: 'ImportSpecifier',
                    imported: {
                        type: 'Identifier',
                        name: superClass,
                    },
                    local: {
                        type: 'Identifier',
                        name: superClass,
                    },
                });
            }
            node.superClass = {
                type: 'Identifier',
                name: superClass,
            };
        },
    });

    writeASTToFile(filePath, fileContents, ast);
}

async function migrateDirectory(directoryPath) {
    const files = await fs.readdir(directoryPath);
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            await migrateDirectory(filePath);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx'))) {
            await migrateFile(filePath);
        }
    }
}

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
    await migrateDirectory(`${APP_DIR}/src`);
    console.log('Running prettier...');
    await exec("npx prettier --write $(git diff --name-only --diff-filter d | grep -E '\\.js|\\.tsx$' | xargs)");
    console.log('Running eslint...');
    // await exec('npx eslint . --max-warnings=0 --fix');
    await stripBlankLinesFromDiff(`${APP_DIR}/src`);
}

run();
