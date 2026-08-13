// rh/immutability: reassigning a local from a callback, which runs after render has completed.
export function ReassignsAfterRender() {
    let latest = 0;
    const onSelect = () => {
        latest = 1;
    };
    return <button onClick={onSelect}>{latest}</button>;
}
