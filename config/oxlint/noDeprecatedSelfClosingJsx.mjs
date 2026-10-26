/**
 * Flags `<MenuItem />` and other self-closing tags of components that are deprecated through their
 * call signature. tsgolint's no-deprecated skips the signature check on self-closing JSX, so it misses
 * these. JS plugins don't get type info, so the components are listed by hand in the rule options in
 * oxlint.config.mts. Delete this rule once tsgolint catches these itself, or every finding shows up twice.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Reads tsconfig.json, which JSON.parse cannot read because it can have comments and trailing commas.
 * @param {string} file
 * @returns {any}
 */
function readJsonc(file) {
    const text = fs
        .readFileSync(file, 'utf8')
        .replaceAll(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (match, string) => string ?? '')
        .replaceAll(/,(\s*[}\]])/g, '$1');
    return JSON.parse(text);
}

let aliasPrefixes;

/**
 * Reads the import aliases (`@components/*`, `@libs/*`, ...) from tsconfig.json, so an import through
 * an alias can be matched to the deprecated component's file. Read once, on first use.
 * @returns {Array<[string, string]>} pairs of alias prefix and the absolute directory it points to
 */
function getAliasPrefixes() {
    if (!aliasPrefixes) {
        const paths = readJsonc(path.join(repoRoot, 'tsconfig.json')).compilerOptions?.paths ?? {};
        aliasPrefixes = Object.entries(paths)
            .filter(([alias, targets]) => alias.endsWith('/*') && targets.at(0)?.endsWith('/*'))
            .map(([alias, targets]) => [alias.slice(0, -1), path.resolve(repoRoot, targets.at(0).slice(0, -1))]);
    }
    return aliasPrefixes;
}

/**
 * Turns an import path into the file it points to, so `@components/MenuItem` and `../MenuItem` both
 * match the `module` set in the rule options.
 * @param {string} source
 * @param {string} filename the importing file
 * @returns {string | null} null for package imports
 */
function resolveModule(source, filename) {
    let resolved = null;
    if (source.startsWith('.')) {
        resolved = path.resolve(path.dirname(filename), source);
    } else {
        const match = getAliasPrefixes().find(([prefix]) => source.startsWith(prefix));
        resolved = match ? path.join(match[1], source.slice(match[0].length)) : null;
    }
    return resolved?.replace(/\.(tsx?|jsx?|mjs)$/, '').replace(/\/index$/, '') ?? null;
}

const meta = {
    type: 'problem',
    docs: {
        description: 'Report self-closing JSX of a component deprecated through its call signature, which tsgolint misses',
    },
    schema: [
        {
            type: 'object',
            properties: {
                components: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            module: {type: 'string'},
                            importName: {type: 'string'},
                            reason: {type: 'string'},
                        },
                        required: ['module', 'importName'],
                        additionalProperties: false,
                    },
                },
            },
            additionalProperties: false,
        },
    ],
};

/**
 * Tells which export an import takes: `import MenuItem from` takes `default`, `import {X as Y} from` takes `X`.
 * @param {{type: 'ImportSpecifier' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier', imported?: {type: string, name?: string, value?: string}}} specifier
 * @returns {string | null} null for a namespace import
 */
function importedName(specifier) {
    if (specifier.type === 'ImportDefaultSpecifier') {
        return 'default';
    }
    if (specifier.type === 'ImportSpecifier') {
        return specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value;
    }
    return null;
}

/**
 * Finds which identifiers a variable may hold, so a deprecated component renamed through
 * `const Item = isNew ? MenuItem : OldItem` is still caught when `<Item />` is used.
 * @param {{type: string} | null | undefined} node the expression a variable is initialized with
 * @returns {string[]}
 */
function initializerIdentifiers(node) {
    if (!node) {
        return [];
    }
    switch (node.type) {
        case 'Identifier':
            return [node.name];
        case 'ConditionalExpression':
            return [...initializerIdentifiers(node.consequent), ...initializerIdentifiers(node.alternate)];
        case 'LogicalExpression':
            return [...initializerIdentifiers(node.left), ...initializerIdentifiers(node.right)];
        case 'TSAsExpression':
        case 'TSSatisfiesExpression':
        case 'TSNonNullExpression':
            return initializerIdentifiers(node.expression);
        default:
            return [];
    }
}

/**
 * Collects the deprecated imports, their aliases and every `<X />` tag while walking the file, and
 * reports at the end, so it does not matter whether an alias is declared before or after its use.
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    const components = context.options[0]?.components ?? [];
    if (components.length === 0) {
        return {};
    }

    const deprecatedBindings = new Map();
    const aliases = [];
    const selfClosingTags = [];

    return {
        ImportDeclaration(node) {
            const resolved = resolveModule(String(node.source.value), context.filename ?? context.getFilename());
            for (const component of components) {
                if (resolved === null || resolved !== path.resolve(repoRoot, component.module)) {
                    continue;
                }
                for (const specifier of node.specifiers) {
                    if (importedName(specifier) === component.importName) {
                        deprecatedBindings.set(specifier.local.name, component);
                    }
                }
            }
        },
        VariableDeclarator(node) {
            if (node.id.type !== 'Identifier') {
                return;
            }
            aliases.push({name: node.id.name, targets: initializerIdentifiers(node.init)});
        },
        JSXOpeningElement(node) {
            if (!node.selfClosing || node.name.type !== 'JSXIdentifier') {
                return;
            }
            selfClosingTags.push(node.name);
        },
        'Program:exit': function () {
            if (deprecatedBindings.size === 0) {
                return;
            }
            for (const alias of aliases) {
                const target = alias.targets.find((name) => deprecatedBindings.has(name));
                if (target && !deprecatedBindings.has(alias.name)) {
                    deprecatedBindings.set(alias.name, deprecatedBindings.get(target));
                }
            }
            for (const name of selfClosingTags) {
                const component = deprecatedBindings.get(name.name);
                if (!component) {
                    continue;
                }
                context.report({
                    node: name,
                    message: component.reason ? `\`${name.name}\` is deprecated. ${component.reason}` : `\`${name.name}\` is deprecated.`,
                });
            }
        },
    };
}

export {meta, create};
