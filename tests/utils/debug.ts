/**
 * The debug utility that ships with react native testing library does not work properly and
 * has limited functionality. This is a better version of it that allows logging a subtree of
 * the app.
 */
/* eslint-disable  no-console, testing-library/no-node-access, testing-library/no-debugging-utils, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-nullish-coalescing */
import type {NewPlugin} from 'pretty-format';
import prettyFormat, {plugins} from 'pretty-format';
import type {ElementType} from 'react';
import ReactIs from 'react-is';

type ReactTestRendererJSON = {
    type: string;
    props: Record<string, unknown>;
    children: null | ReactTestRendererNode[];
};
type ReactTestRendererNode = ReactTestRendererJSON | string;
type ReactTestInstance = {
    instance: any;
    type: ElementType;
    props: Record<string, unknown>;
    parent: null | ReactTestInstance;
    children: Array<ReactTestInstance | string>;
};

// These are giant objects and cause the serializer to crash because the
// output becomes too large.
const NativeComponentPlugin: NewPlugin = {
    // eslint-disable-next-line no-underscore-dangle
    test: (val) => !!val?._reactInternalInstance,
    serialize: () => 'NativeComponentInstance {}',
};

type Options = {
    includeProps?: boolean;
    maxDepth?: number;
};

const format = (input: ReactTestRendererJSON | ReactTestRendererJSON[], options: Options) =>
    prettyFormat(input, {
        plugins: [plugins.ReactTestComponent, plugins.ReactElement, NativeComponentPlugin],
        highlight: true,
        printBasicPrototype: false,
        maxDepth: options.maxDepth,
    });

function getType(element: any) {
    const type = element.type;
    if (typeof type === 'string') {
        return type;
    }
    if (typeof type === 'function') {
        return type.displayName || type.name || 'Unknown';
    }

    if (ReactIs.isFragment(element)) {
        return 'React.Fragment';
    }
    if (ReactIs.isSuspense(element)) {
        return 'React.Suspense';
    }
    if (typeof type === 'object' && type !== null) {
        if (ReactIs.isContextProvider(element)) {
            return 'Context.Provider';
        }

        if (ReactIs.isContextConsumer(element)) {
            return 'Context.Consumer';
        }

        if (ReactIs.isForwardRef(element)) {
            if (type.displayName) {
                return type.displayName;
            }

            const functionName = type.render.displayName || type.render.name || '';

            return functionName === '' ? 'ForwardRef' : `ForwardRef(${functionName})`;
        }

        if (ReactIs.isMemo(element)) {
            const functionName = type.displayName || type.type.displayName || type.type.name || '';

            return functionName === '' ? 'Memo' : `Memo(${functionName})`;
        }
    }
    return 'UNDEFINED';
}

function getProps(props: Record<string, unknown>, options: Options) {
    if (!options.includeProps) {
        return {};
    }
    const {children, ...propsWithoutChildren} = props;
    return propsWithoutChildren;
}

function toJSON(node: ReactTestInstance, options: Options): ReactTestRendererJSON {
    const json = {
        $$typeof: Symbol.for('react.test.json'),
        type: getType({type: node.type, $$typeof: Symbol.for('react.element')}),
        props: getProps(node.props, options),
        children: node.children?.map((c) => (typeof c === 'string' ? c : toJSON(c, options))) ?? null,
    };

    return json;
}

function formatNode(node: ReactTestInstance, options: Options) {
    return format(toJSON(node, options), options);
}

/**
 * Log a subtree of the app for debugging purposes.
 *
 * @example debug(screen.getByTestId('report-actions-view-wrapper'));
 */
export default function debug(node: ReactTestInstance | ReactTestInstance[] | null, {includeProps = true, maxDepth = Infinity}: Options = {}): void {
    const options = {includeProps, maxDepth};
    if (node == null) {
        console.log('null');
    } else if (Array.isArray(node)) {
        console.log(node.map((n) => formatNode(n, options)).join('\n'));
    } else {
        console.log(formatNode(node, options));
    }
}
