// reactNativeRulesBatch part C: the react/* rules whose violations cannot type-check.
// Two reasons a rule lands here. Either the shape is a TypeScript error in a .tsx file (a duplicate
// JSX attribute, an undefined component, a string ref, a string style, children on a void element,
// `this` in a function component, a render with no return), or React 19 deleted the API the rule is
// about (isMounted, findDOMNode, ReactDOM.render, React.createClass). fixtures/tsconfig.json sets
// allowJs false and includes only *.ts and *.tsx, so nothing here reaches tsc and the parity rows
// still exist. Same violation-then-control shape as parts A and B.
import React from 'react';
import ReactDOM from 'react-dom';
// create-react-class is not installed. It does not need to be: neither linter resolves the module,
// and this file is outside tsconfig, so the import only has to exist for the rule to see the call.
import createReactClass from 'create-react-class';

const node = null;
const container = null;

// jsx-no-duplicate-props
export const duplicateProps = <div id="first" id="second" />;
// control
export const singleProp = <div id="first" />;

// jsx-no-undef
export const undefinedComponent = <NeverDeclared />;
// control
export const definedComponent = <div />;

// no-namespace
export const namespacedElement = <svg:circle />;
// control
export const plainElement = <circle />;

// no-unknown-property
export const unknownProperty = <div class="x" />;
// control
export const knownProperty = <div className="x" />;

// no-string-refs
export const stringRef = <div ref="theRef" />;
// control
export const callbackRef = <div ref={() => undefined} />;

// no-this-in-sfc
export function ThisInFunctionComponent() {
    return <div>{this.props.label}</div>;
}
// control
export function PropsInFunctionComponent(props) {
    return <div>{props.label}</div>;
}

// style-prop-object
export const stringStyle = <div style="color: red" />;
// control
export const objectStyle = <div style={{color: 'red'}} />;

// void-dom-elements-no-children
export const voidWithChildren = <br>child</br>;
// control
export const voidWithoutChildren = <br />;

// prefer-es6-class ('always'): React.createClass was dropped from the plugin's ES5-component
// detection when React removed it in v16, so the createReactClass factory is the shape that reports.
export const LegacyClass = createReactClass({
    render() {
        return <div />;
    },
});
// control
export class Es6Class extends React.Component {
    render() {
        return <div />;
    }
}

// no-is-mounted
export class ChecksIsMounted extends React.Component {
    poll() {
        return this.isMounted();
    }

    render() {
        return <div />;
    }
}

// require-render-return
export class RendersNothing extends React.Component {
    render() {
        const unused = 1;
        void unused;
    }
}
// control
export class RendersSomething extends React.Component {
    render() {
        return <div />;
    }
}

// no-find-dom-node
export const foundNode = ReactDOM.findDOMNode(node);
// control
export const madeRef = React.createRef();

// no-render-return-value
export const renderResult = ReactDOM.render(<div />, container);
// control
export function renderIgnoringResult() {
    ReactDOM.render(<div />, container);
}
