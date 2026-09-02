// rh/error-boundaries: try/catch around a child's render instead of an error boundary.
export function CatchesChildRender({Child}: {Child: () => JSX.Element}) {
    try {
        return <Child />;
    } catch {
        return null;
    }
}
