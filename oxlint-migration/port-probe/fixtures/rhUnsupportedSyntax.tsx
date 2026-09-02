// rh/unsupported-syntax: eval() in a component, which the compiler will not support.
export function UsesEval() {
    eval('1');
    return <div />;
}
