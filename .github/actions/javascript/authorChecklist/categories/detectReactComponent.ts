import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import {isIdentifier, isMemberExpression} from '@babel/types';

function isComponentOrPureComponent(name?: string) {
    return name === 'Component' || name === 'PureComponent';
}

function detectReactComponent(code: string, filename: string): boolean | undefined {
    if (!code) {
        console.error('failed to get code from a filename', code, filename);
        return;
    }
    const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'], // enable jsx plugin
    });

    let isReactComponent = false;

    traverse(ast, {
        enter(path) {
            if (isReactComponent) {
                return;
            }
            if (path.isFunctionDeclaration() || path.isArrowFunctionExpression() || path.isFunctionExpression()) {
                path.traverse({
                    JSXElement() {
                        isReactComponent = true;
                        path.stop();
                    },
                });
            }
        },

        ClassDeclaration(path) {
            const {superClass} = path.node;
            const extendsReactDotComponent =
                isMemberExpression(superClass) &&
                isIdentifier(superClass.object) &&
                superClass.object.name === 'React' &&
                isIdentifier(superClass.property) &&
                isComponentOrPureComponent(superClass.property.name);
            const extendsBareComponent = isIdentifier(superClass) && isComponentOrPureComponent(superClass.name);
            if (extendsReactDotComponent || extendsBareComponent) {
                isReactComponent = true;
                path.stop();
            }
        },
    });

    return isReactComponent;
}

export default detectReactComponent;
