const name = 'no-direct-pre-insert-fullscreen-under-rhp';
const NAVIGATION_MODULE_SUFFIX = '/Navigation/Navigation';
const PRE_INSERT_METHOD_NAME = 'preInsertFullscreenUnderRHP';

const ALLOWED_FILE_SUFFIXES = [
    'src/hooks/usePreMountDestination/index.ts',
    'src/hooks/useSkipConfirmationPreInsert.ts',
    'src/libs/Navigation/Navigation.ts',
    'src/pages/iou/request/step/IOURequestStepConfirmation.tsx',
];

const meta = {
    type: 'problem',
    docs: {
        description: 'Require usePreMountDestination instead of calling Navigation.preInsertFullscreenUnderRHP directly.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        useHookInstead:
            'Use usePreMountDestination for RHP-to-fullscreen pre-mounting instead of calling Navigation.preInsertFullscreenUnderRHP directly. See .claude/skills/coding-standards/rules/perf-17-use-pre-mount-destination.md.',
    },
};

function isAllowedFile(filename) {
    const normalizedFilename = filename.replaceAll('\\', '/');
    return ALLOWED_FILE_SUFFIXES.some((allowedSuffix) => normalizedFilename.endsWith(allowedSuffix));
}

function isStaticPreInsertProperty(property, computed) {
    if (!property) {
        return false;
    }

    if (!computed && property.type === 'Identifier') {
        return property.name === PRE_INSERT_METHOD_NAME;
    }

    return property.type === 'Literal' && property.value === PRE_INSERT_METHOD_NAME;
}

function isNavigationModuleImport(sourceValue) {
    return (
        typeof sourceValue === 'string' &&
        (sourceValue === '@libs/Navigation/Navigation' || sourceValue === '@src/libs/Navigation/Navigation' || sourceValue.endsWith(NAVIGATION_MODULE_SUFFIX))
    );
}

function getVariableByName(scope, variableName) {
    let currentScope = scope;

    while (currentScope) {
        const variable = currentScope.variables.find((scopeVariable) => scopeVariable.name === variableName);

        if (variable) {
            return variable;
        }

        currentScope = currentScope.upper;
    }

    return null;
}

function isNavigationPreInsertMemberExpression(node, scope, navigationImportBindings) {
    if (node?.type !== 'MemberExpression' || node.object.type !== 'Identifier' || !isStaticPreInsertProperty(node.property, node.computed)) {
        return false;
    }

    const objectVariable = getVariableByName(scope, node.object.name);
    return !!objectVariable && navigationImportBindings.has(objectVariable);
}

function isPreInsertFullscreenUnderRHPCall(node, scope, navigationImportBindings) {
    return node.type === 'CallExpression' && isNavigationPreInsertMemberExpression(node.callee, scope, navigationImportBindings);
}

function getPreInsertAliasFromObjectPatternProperty(property) {
    if (property.type !== 'Property' || !isStaticPreInsertProperty(property.key, property.computed) || property.value.type !== 'Identifier') {
        return null;
    }

    return property.value.name;
}

function create(context) {
    const filename = context.getFilename();

    if (isAllowedFile(filename)) {
        return {};
    }

    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const navigationImportBindings = new WeakSet();
    const preInsertAliases = new WeakSet();

    function trackBinding(node, bindingName, bindings) {
        const aliasVariable = sourceCode.getDeclaredVariables(node).find((variable) => variable.name === bindingName);

        if (aliasVariable) {
            bindings.add(aliasVariable);
        }
    }

    function trackPreInsertAlias(node, aliasName) {
        trackBinding(node, aliasName, preInsertAliases);
    }

    function trackNavigationImport(node, localName) {
        trackBinding(node, localName, navigationImportBindings);
    }

    return {
        ImportDeclaration(node) {
            if (!isNavigationModuleImport(node.source.value)) {
                return;
            }

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackNavigationImport(node, specifier.local.name);
                }
            }
        },
        VariableDeclarator(node) {
            if (node.id.type === 'ObjectPattern' && node.init?.type === 'Identifier' && navigationImportBindings.has(getVariableByName(sourceCode.getScope(node), node.init.name))) {
                for (const property of node.id.properties) {
                    const alias = getPreInsertAliasFromObjectPatternProperty(property);
                    if (alias) {
                        trackPreInsertAlias(node, alias);
                    }
                }
                return;
            }

            if (node.id.type === 'Identifier' && isNavigationPreInsertMemberExpression(node.init, sourceCode.getScope(node), navigationImportBindings)) {
                trackPreInsertAlias(node, node.id.name);
            }
        },
        CallExpression(node) {
            const scope = sourceCode.getScope(node);
            const calleeVariable = node.callee.type === 'Identifier' ? getVariableByName(scope, node.callee.name) : null;
            const isTrackedAliasCall = !!calleeVariable && preInsertAliases.has(calleeVariable);

            if (!isPreInsertFullscreenUnderRHPCall(node, scope, navigationImportBindings) && !isTrackedAliasCall) {
                return;
            }

            context.report({
                node,
                messageId: 'useHookInstead',
            });
        },
    };
}

export {name, meta, create};
