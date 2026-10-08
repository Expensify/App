// rh/purity: calling a known-impure global during render.
export function ImpureRender() {
    const value = Math.random();
    return <div>{value}</div>;
}
