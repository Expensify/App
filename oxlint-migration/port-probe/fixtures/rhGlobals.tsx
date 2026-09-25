// rh/globals: mutating a module-level value during render.
let renderCount = 0;

export function MutatesGlobal() {
    renderCount += 1;
    return <div>{renderCount}</div>;
}
