// rh/static-components: a component declared inside another component, so it is a new type on every
// render and its state resets.
export function Outer({label}: {label: string}) {
    function Inner() {
        return <span>{label}</span>;
    }
    return <Inner />;
}
