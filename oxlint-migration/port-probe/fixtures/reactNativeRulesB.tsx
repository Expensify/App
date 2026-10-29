// reactNativeRulesBatch part B: the class-component half of the native react/* parity batch.
// Same violation-then-control shape as part A, and the same rule: everything here type-checks.
// no-is-mounted, no-find-dom-node and no-render-return-value are NOT here: React 19 dropped
// isMounted, findDOMNode and ReactDOM.render from the types, so their violations cannot compile.
// require-render-return is out for the same reason: a render with no return fails TS2416 against
// the base class signature. All four live in reactNativeRulesC.jsx, which tsconfig does not
// include (allowJs is false), so shapes that cannot compile still get a parity row.
import React from 'react';

// no-did-update-set-state
export class UpdatesOnDidUpdate extends React.Component<{label: string}, {count: number}> {
    constructor(props: {label: string}) {
        super(props);
        this.state = {count: 0};
    }

    componentDidUpdate(): void {
        this.setState({count: 1});
    }

    render(): React.ReactNode {
        return <div>{this.state.count}</div>;
    }
}

// no-will-update-set-state
export class UpdatesOnWillUpdate extends React.Component<{label: string}, {count: number}> {
    constructor(props: {label: string}) {
        super(props);
        this.state = {count: 0};
    }

    componentWillUpdate(): void {
        this.setState({count: 1});
    }

    render(): React.ReactNode {
        return <div>{this.state.count}</div>;
    }
}

// no-redundant-should-component-update: PureComponent already shallow-compares.
export class RedundantShouldUpdate extends React.PureComponent<{label: string}> {
    shouldComponentUpdate(): boolean {
        return true;
    }

    render(): React.ReactNode {
        return <div>{this.props.label}</div>;
    }
}
// control: the same method on a plain Component is not redundant.
export class NeededShouldUpdate extends React.Component<{label: string}> {
    shouldComponentUpdate(): boolean {
        return true;
    }

    render(): React.ReactNode {
        return <div>{this.props.label}</div>;
    }
}

// state-in-constructor ('always'): a class property instead of a constructor assignment.
export class StateAsClassProperty extends React.Component<{label: string}, {count: number}> {
    state = {count: 0};

    render(): React.ReactNode {
        return <div>{this.state.count}</div>;
    }
}

// no-unsafe (checkAliases: true): the un-prefixed alias counts.
export class UsesUnsafeLifecycle extends React.Component<{label: string}> {
    componentWillMount(): void {
        return undefined;
    }

    render(): React.ReactNode {
        return <div>{this.props.label}</div>;
    }
}
// control: the safe lifecycle.
export class UsesSafeLifecycle extends React.Component<{label: string}> {
    componentDidMount(): void {
        return undefined;
    }

    render(): React.ReactNode {
        return <div>{this.props.label}</div>;
    }
}
