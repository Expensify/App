// Parity fixture for the four typed `typescript/*` rules production enables but the production
// ESLint config does not: no-require-imports, only-throw-error, prefer-promise-reject-errors and
// require-await. One violation per rule, each with an adjacent control that satisfies it. The
// controls are load-bearing: without them a row could sit at 1/1 for a file that would also pass
// with no type information at all, which is exactly the failure mode of a broken typed harness.
import fs = require('node:fs');
import path from 'node:path';

export function readConfig(dir: string, name: string): string {
    return fs.readFileSync(path.join(dir, name), 'utf8');
}

export function failWithReason(missing: boolean): void {
    if (missing) {
        throw 'missing';
    }

    throw new Error('missing');
}

export function rejectWithReason(rejected: boolean): Promise<never> {
    if (rejected) {
        return Promise.reject('nope');
    }

    return Promise.reject(new Error('nope'));
}

export async function unawaited(value: number): Promise<number> {
    return value;
}

export async function awaited(value: number): Promise<number> {
    return await Promise.resolve(value);
}
