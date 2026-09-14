// Anchor fixture for type-aware native rules: it proves the probe harness reaches tsgolint
// (oxlint --type-aware) and typescript-eslint's projectService at the same time. The floating
// call is the violation; the awaited one right below is the control that keeps the rule from
// being pinned by a fixture that would also pass if the type information never arrived.
async function fetchThing(): Promise<number> {
    return 1;
}

export function fire(): void {
    fetchThing();
}

export async function behave(): Promise<number> {
    return fetchThing();
}
