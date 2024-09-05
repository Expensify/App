/* eslint-disable no-console */
export default function transform(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    const getKeyName = (node) => {
        if (node.type === 'Identifier') {
            return node.name;
        }
        if (node.type === 'MemberExpression') {
            return `${getKeyName(node.object)}.${getKeyName(node.property)}`;
        }
        if (node.type === 'ArrowFunctionExpression') {
            const arrowFunctionBodySource = j(node.body).toSource();
            return arrowFunctionBodySource.replace(/\}\$\{/g, '}${props.');
        }
        return '';
    };

    const createHooks = function (hooksArray) {
        return hooksArray.map((hook) => {
            const optionsObjectExpression = j.objectExpression(
                Object.entries(hook.options)
                    .filter(([, value]) => value !== undefined)
                    .map(([key, value]) => j.objectProperty(j.identifier(key), j.literal(value))),
            );

            const variableDeclaration = j.variableDeclaration('const', [
                j.variableDeclarator(
                    j.arrayPattern([j.identifier(hook.name), j.identifier(`${hook.name}Metadata`)]),
                    j.callExpression(j.identifier('useOnyx'), [j.identifier(hook.value), ...(Object.keys(optionsObjectExpression.properties).length ? [optionsObjectExpression] : [])]),
                ),
            ]);

            const comment = hook.selector ? j.commentBlock(`\nSelector FIXME: ${hook.selector}\n`) : null;
            if (comment) {
                variableDeclaration.comments = [comment];
            }

            return variableDeclaration;
        });
    };

    const createProps = function (hooksArray) {
        return hooksArray.map((hook) => {
            return j.jsxAttribute(j.jsxIdentifier(hook.name), j.jsxExpressionContainer(j.identifier(hook.name)));
        });
    };

    const createReturnComponent = function (hooks, componentSource) {
        const jsxProps = createProps(hooks);
        const spreadProps = j.jsxSpreadAttribute(j.identifier('props'));
        spreadProps.comments = [j.commentLine(' eslint-disable-next-line react/jsx-props-no-spreading', false, true)];

        return j.returnStatement(
            j.jsxElement(
                j.jsxOpeningElement(
                    j.jsxIdentifier(componentSource),
                    [spreadProps, ...jsxProps], // using spread attributes
                    true, // self closing
                ),
            ),
        );
    };

    const ifLoadingReturnComponent = function (hooksDeclarations) {
        return j.ifStatement(
            j.callExpression(
                j.identifier('isLoadingOnyxValue'),
                hooksDeclarations.map(
                    (hookDeclaration) => j.identifier(`${hookDeclaration.declarations[0].id.elements[1].name}`), // Assumes metadata is the second declared variable
                ),
            ),
            j.blockStatement([j.returnStatement(j.literal(null))]),
        );
    };

    const createFunction = function (hooksDeclarations, ifLoadingReturnNull, returnJsx, componentProps, componentPropsOnyx) {
        const functionParameters = [j.identifier(`props: Omit<${componentProps}, keyof ${componentPropsOnyx}>`)];
        const functionBody = [...hooksDeclarations, ifLoadingReturnNull, returnJsx];
        return j.functionDeclaration(j.identifier('ComponentWithOnyx'), functionParameters, j.blockStatement(functionBody), false, false);
    };

    const updateImports = function () {
        root.find(j.ImportDeclaration, {
            source: {value: 'react-native-onyx'},
        }).forEach((path2) => {
            // Get the specifiers
            const specifiers = path2.value.specifiers;
            // Search for withOnyx and replace it by useOnyx
            const withOnyxSpecifier = specifiers.find((specifier) => specifier.type === 'ImportSpecifier' && specifier.imported.name === 'withOnyx');

            if (withOnyxSpecifier) {
                withOnyxSpecifier.imported.name = 'useOnyx';
            }
        });
        const isLoadingOnyxValueImport = j.importDeclaration([j.importDefaultSpecifier(j.identifier('isLoadingOnyxValue'))], j.literal('@src/types/utils/isLoadingOnyxValue'));
        root.find(j.Program).get('body').unshift(isLoadingOnyxValueImport);
    };

    let updateFile = false;

    root.find(j.ExportDefaultDeclaration)
        .filter((path) => {
            const callExpression = path.value.declaration;

            return j.match(callExpression, {
                type: 'CallExpression',
                callee: {
                    type: 'CallExpression',
                    callee: {
                        type: 'Identifier',
                        name: 'withOnyx',
                    },
                },
            });
        })
        .forEach((path) => {
            updateFile = true;
            const callExpression = path.value.declaration;
            const hocArgs = callExpression.callee.arguments;

            if (hocArgs.length > 1) {
                console.warn(file.path, 'More than one argument');
                throw new Error('More than one argument');
            }

            const [componentProps, componentPropsOnyx] = callExpression.callee.typeParameters.params.map((node) => {
                // Check if the type is a intersection type
                if (node.type === 'TSIntersectionType') {
                    // Join the types by an & operator
                    return node.types.map((typeNode) => typeNode.typeName.name).join(' & ');
                }

                return node.typeName.name;
            });

            if (!componentProps || !componentPropsOnyx) {
                console.warn(file.path, 'Component props or onyx props not found');
                throw new Error('Component props or onyx props not found');
            }

            const component = callExpression.arguments[callExpression.arguments.length - 1];
            const componentSource = j(component).toSource();
            const hooks = [];

            if (!componentSource) {
                console.warn(file.path, 'Component source not found');
                throw new Error('Component source not found');
            }

            const hocFirstArgument = hocArgs[0].properties;

            hocFirstArgument.forEach((objectProperty) => {
                const onyxKeyName = objectProperty.key.name;
                const onyxKeyValueObject = objectProperty.value.properties.find((property) => property.key.name === 'key');

                if (!onyxKeyValueObject) {
                    console.warn(file.path, 'Onyx key object value not found');
                    throw new Error('Onyx key object value not found');
                }
                const onyxKeyValue = getKeyName(onyxKeyValueObject.value);

                if (!onyxKeyValue) {
                    console.warn(file.path, 'Onyx key value not found');
                    throw new Error('Onyx key value not found');
                }

                const optionsProperties = ['canEvict', 'initWithStoredValues', 'allowStaleData'];
                const options = {};

                optionsProperties.forEach((optionProperty) => {
                    const optionPropertyValueObject = objectProperty.value.properties.find((property) => property.key.name === optionProperty);
                    options[optionProperty] = optionPropertyValueObject ? optionPropertyValueObject.value.value : undefined;
                });
                const selectorObject = objectProperty.value.properties.find((property) => property.key.name === 'selector');
                const selectorString = selectorObject ? j(selectorObject.value).toSource() : undefined;

                hooks.push({
                    name: onyxKeyName,
                    value: onyxKeyValue,
                    options,
                    selector: selectorString,
                });
            });

            const hooksDeclarations = createHooks(hooks);
            const ifLoadingReturnNull = ifLoadingReturnComponent(hooksDeclarations);
            const returnJsx = createReturnComponent(hooks, componentSource);
            const functionDeclaration = createFunction(hooksDeclarations, ifLoadingReturnNull, returnJsx, componentProps, componentPropsOnyx);

            // Create an export default declaration
            const exportDefaultDeclaration = j.exportDefaultDeclaration(functionDeclaration);

            // Replace
            if (false) {
                console.log(j(exportDefaultDeclaration).toSource());
            } else {
                j(path).replaceWith();
                updateImports(root);
                root.find(j.Program).get('body').push(exportDefaultDeclaration);
            }
        });

    if (updateFile) {
        return root.toSource();
    }
}
