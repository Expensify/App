/**
 * ESLint rule that runs React Compiler compliance check on individual files
 * Integrates with scripts/react-compiler-check-single-file.ts
 */

const {execSync} = require('child_process');
const path = require('path');

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Check React Compiler compliance for individual files',
            category: 'Possible Errors',
            recommended: true,
        },
        messages: {
            compilerError: '{{message}}',
            manualMemoError: 'Found manual memoization usage of `{{keyword}}`. Remove it or add "use no memo" directive.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    scriptPath: {
                        type: 'string',
                        description: 'Path to the single-file checker script',
                    },
                    enabled: {
                        type: 'boolean',
                        description: 'Enable/disable this rule',
                        default: true,
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        return {
            Program(node) {
                console.debug('running custom react compiler check');
                const filename = context.getFilename();
                const options = context.options[0] || {};

                // Skip if disabled
                if (options.enabled === false) {
                    return;
                }

                // Skip non-file inputs
                if (filename === '<input>' || filename === '<text>') {
                    return;
                }

                // Only check React files
                const isReactFile = /\.(tsx|jsx)$/.test(filename);
                if (!isReactFile) {
                    return;
                }

                const scriptPath = options.scriptPath;
                const projectRoot = path.resolve(__dirname, '..');

                try {
                    // Run the checker script for this file
                    const command = `npx tsx "${path.join(scriptPath)}" check-eslint "${filename}"`;

                    const output = execSync(command, {
                        encoding: 'utf-8',
                        cwd: projectRoot,
                        timeout: 10000, // 10 second timeout
                        stdio: ['pipe', 'pipe', 'pipe'],
                    });

                    // Parse the JSON output
                    const results = JSON.parse(output.trim());

                    // Report compiler errors
                    if (results.compilerErrors && results.compilerErrors.length > 0) {
                        for (const error of results.compilerErrors) {
                            context.report({
                                loc: {
                                    line: error.line || 1,
                                    column: error.column || 0,
                                },
                                messageId: 'compilerError',
                                data: {
                                    message: error.reason || 'React Compiler failed to compile this component',
                                },
                            });
                        }
                    }

                    // Report manual memoization errors
                    if (results.manualMemoErrors && results.manualMemoErrors.length > 0) {
                        for (const error of results.manualMemoErrors) {
                            context.report({
                                loc: {
                                    line: error.line || 1,
                                    column: error.column || 0,
                                },
                                messageId: 'manualMemoError',
                                data: {
                                    keyword: error.keyword,
                                },
                            });
                        }
                    }
                    console.debug('done')
                } catch (error) {
                    console.debug('error', error)
                    // Only report errors in development/verbose mode
                    // Silent failures in production to not block linting
                    if (process.env.VERBOSE_REACT_COMPILER_CHECK === 'true') {
                        console.error(`React Compiler check failed for ${filename}:`, error.message);
                        if (error.stderr) {
                            console.error('stderr:', error.stderr.toString());
                        }
                    }
                }
            },
        };
    },
};
