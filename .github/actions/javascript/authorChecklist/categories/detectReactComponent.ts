import {parse} from '@babel/parser';
import traverse from '@babel/traverse';

type SuperClassType = {superClass: {name?: string; object: {name: string}; property: {name: string}} | null; name: string};

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
            const {superClass} = path.node as unknown as SuperClassType;
            if (superClass && ((superClass.object?.name === 'React' && isComponentOrPureComponent(superClass.property.name)) || isComponentOrPureComponent(superClass.name))) {
                isReactComponent = true;
                path.stop();
            }
        },
    });

    return isReactComponent;
}

export default detectReactComponent;
