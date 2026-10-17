// tsgolint's no-deprecated skips the signature check on self-closing JSX (`<X />`, not `<X></X>`), so a
// component deprecated only through its signature, like `MenuItem` wrapped in `Object.assign`, goes
// unreported. jsPlugins get no types, so the components are listed in the options. Delete this rule once
// tsgolint reports these itself: the findings will double.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// tsconfig.json allows comments and trailing commas.
function readJsonc(file) {
    const text = fs
        .readFileSync(file, 'utf8')
        .replaceAll(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (match, string) => string ?? '')
        .replaceAll(/,(\s*[}\]])/g, '$1');
    return JSON.parse(text);
}

let aliasPrefixes;

function getAliasPrefixes() {
    if (!aliasPrefixes) {
        const paths = readJsonc(path.join(repoRoot, 'tsconfig.json')).compilerOptions?.paths ?? {};
        aliasPrefixes = Object.entries(paths)
            .filter(([alias, targets]) => alias.endsWith('/*') && targets.at(0)?.endsWith('/*'))
            .map(([alias, targets]) => [alias.slice(0, -1), path.resolve(repoRoot, targets.at(0).slice(0, -1))]);
    }
    return aliasPrefixes;
}

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

function importedName(specifier) {
    if (specifier.type === 'ImportDefaultSpecifier') {
        return 'default';
    }
    if (specifier.type === 'ImportSpecifier') {
        return specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value;
    }
    return null;
}

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
