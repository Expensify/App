/** Unwrap Bun's __toESM(require(), 1) double-default when importing CJS modules. */
function getCjsDefaultExport(namespace: Record<string, unknown>): unknown {
    const first = namespace.default ?? namespace;
    const second = typeof first === 'object' && first !== null && 'default' in first ? ((first as Record<string, unknown>).default ?? first) : first;

    return second;
}

export default getCjsDefaultExport;
