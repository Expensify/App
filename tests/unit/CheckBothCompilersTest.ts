import {spawnSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

type CompilationResult = {
    status: 'compiled' | 'failed' | 'no-components';
    memoized: boolean;
    errors: unknown[];
};

type DualResult = {
    babel: CompilationResult;
    oxc: CompilationResult;
    isDivergent: boolean;
};

const runnerPath = path.resolve(__dirname, '../../scripts/check-both-compilers-runner.mjs');

function isCompilationResult(value: unknown): value is CompilationResult {
    if (typeof value !== 'object' || value === null || !('status' in value) || !('memoized' in value) || !('errors' in value)) {
        return false;
    }
    const {status, memoized, errors} = value;
    return (status === 'compiled' || status === 'failed' || status === 'no-components') && typeof memoized === 'boolean' && Array.isArray(errors);
}

function isDualResult(value: unknown): value is DualResult {
    if (typeof value !== 'object' || value === null || !('babel' in value) || !('oxc' in value) || !('isDivergent' in value)) {
        return false;
    }
    const {babel, oxc, isDivergent} = value;
    return isCompilationResult(babel) && isCompilationResult(oxc) && typeof isDivergent === 'boolean';
}

function checkBothCompilers(source: string, filename: string): DualResult {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-both-compilers-'));
    const sourcePath = path.join(tmpDir, path.basename(filename));

    try {
        fs.writeFileSync(sourcePath, source);
        const result = spawnSync(process.execPath, ['--experimental-vm-modules', runnerPath, filename, sourcePath], {
            encoding: 'utf8',
        });

        if (result.status !== 0) {
            throw new Error(result.stderr || result.stdout || 'check-both-compilers-runner failed');
        }

        const parsed: unknown = JSON.parse(result.stdout);
        if (!isDualResult(parsed)) {
            throw new Error('check-both-compilers-runner returned invalid JSON');
        }

        return parsed;
    } finally {
        fs.rmSync(tmpDir, {recursive: true, force: true});
    }
}

describe('checkBothCompilers', () => {
    it('reports both compilers memoizing a component and no divergence', () => {
        const source = `
            function MyComponent({items}: {items: number[]}) {
                const doubled = items.map((x) => x * 2);
                return <div>{doubled.join(',')}</div>;
            }
        `;
        const result = checkBothCompilers(source, 'MyComponent.tsx');
        expect(result.babel.memoized).toBe(true);
        expect(result.oxc.memoized).toBe(true);
        expect(result.isDivergent).toBe(false);
    });

    it('reports neither compiler memoizing a plain utility file and no divergence', () => {
        const source = `
            export function add(a: number, b: number): number {
                return a + b;
            }
        `;
        const result = checkBothCompilers(source, 'mathUtils.ts');
        expect(result.babel.memoized).toBe(false);
        expect(result.oxc.memoized).toBe(false);
        expect(result.isDivergent).toBe(false);
    });

    it('computes divergence as the XOR of the two compilers memoizing the file', () => {
        const source = `
            function MyComponent({items}: {items: number[]}) {
                const doubled = items.map((x) => x * 2);
                return <div>{doubled.join(',')}</div>;
            }
        `;
        const result = checkBothCompilers(source, 'MyComponent.tsx');
        expect(result.isDivergent).toBe(result.babel.memoized !== result.oxc.memoized);
    });
});
