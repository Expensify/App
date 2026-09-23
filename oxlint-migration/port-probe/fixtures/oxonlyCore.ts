// Parity fixture for three core rules production enables with options this probe pins: the
// oxlint side runs them natively under their bare ids, the ESLint side runs ESLint core.
// One violation per rule plus a control that satisfies it.

export function buildPattern(): RegExp {
    return new RegExp('parity');
}

// Control: the literal form prefer-regex-literals asks for.
export const literalPattern = /parity/;

export const sum = (a: number, b: number): number => {
    return a + b;
};

// Control: the expression body arrow-body-style asks for.
export const diff = (a: number, b: number): number => a - b;

// The hazard is real ASI: the two lines below parse as one expression, `rows[0].push(1)`, which
// is why the merged form still type-checks and why no semicolon was needed to hide it.
export function hazard(rows: number[][]): number {
    const pushed = rows[0].push(1);

    return pushed;
}

// Control: the same statement, terminated, so the second line cannot continue the first.
export function safe(rows: number[][]): number {
    const pushed = rows;
    [0].push(1);

    return pushed;
}
