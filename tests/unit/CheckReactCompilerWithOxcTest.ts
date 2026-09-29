import {spawnSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

type SourceLocation = {
    start: {line: number; column: number};
    end: {line: number; column: number};
};

type CompilerError = {
    reason: string;
    severity: string;
    loc?: SourceLocation;
};

type CompilationResult = {
    status: 'compiled' | 'failed' | 'no-components';
    errors: CompilerError[];
};

const runnerPath = path.resolve(__dirname, '../../scripts/check-react-compiler-with-oxc-runner.mjs');

function isCompilationResult(value: unknown): value is CompilationResult {
    if (typeof value !== 'object' || value === null || !('status' in value) || !('errors' in value)) {
        return false;
    }

    const {status, errors} = value;
    return (status === 'compiled' || status === 'failed' || status === 'no-components') && Array.isArray(errors);
}

function checkReactCompilerWithOxc(source: string, filename: string): CompilationResult {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-react-compiler-oxc-'));
    const sourcePath = path.join(tmpDir, path.basename(filename));

    try {
        fs.writeFileSync(sourcePath, source);
        const result = spawnSync(process.execPath, ['--experimental-vm-modules', runnerPath, filename, sourcePath], {
            encoding: 'utf8',
        });

        if (result.status !== 0) {
            throw new Error(result.stderr || result.stdout || 'check-react-compiler-with-oxc-runner failed');
        }

        const parsed: unknown = JSON.parse(result.stdout);
        if (!isCompilationResult(parsed)) {
            throw new Error('check-react-compiler-with-oxc-runner returned invalid JSON');
        }

        return parsed;
    } finally {
        fs.rmSync(tmpDir, {recursive: true, force: true});
    }
}

describe('checkReactCompilerWithOxc', () => {
    it('returns compiled for a simple component', () => {
        const source = `
            import {useState} from 'react';
            function MyComponent() {
                const [value] = useState(0);
                return <div>Hello {value}</div>;
            }
        `;
        const result = checkReactCompilerWithOxc(source, 'MyComponent.tsx');
        expect(result.status).toBe('compiled');
        expect(result.errors).toEqual([]);
    });

    it('returns compiled for a hook that compiles', () => {
        const source = `
            import {useState} from 'react';
            function useMyHook() {
                const [value, setValue] = useState(0);
                return value;
            }
        `;
        const result = checkReactCompilerWithOxc(source, 'useMyHook.ts');
        expect(result.status).toBe('compiled');
        expect(result.errors).toEqual([]);
    });

    it('returns failed with error details for a component with a Rules of React violation', () => {
        const source = `
import {useState} from 'react';
function BadComponent({condition}) {
    if (condition) {
        const [value] = useState(0);
    }
    return <div>Bad</div>;
}
        `.trim();
        const result = checkReactCompilerWithOxc(source, 'BadComponent.tsx');
        expect(result.status).toBe('failed');
        expect(result.errors.length).toBeGreaterThan(0);

        const error = result.errors.at(0);
        expect(error).toBeDefined();
        expect(error?.reason).toContain('Hooks must always be called in a consistent order');
        expect(error?.loc).toBeDefined();
        expect(error?.loc?.start.line).toBeGreaterThan(0);
    });

    it('returns no-components for a plain utility file', () => {
        const source = `
            export function add(a: number, b: number): number {
                return a + b;
            }
            export function subtract(a: number, b: number): number {
                return a - b;
            }
        `;
        const result = checkReactCompilerWithOxc(source, 'mathUtils.ts');
        expect(result.status).toBe('no-components');
        expect(result.errors).toEqual([]);
    });

    it('returns no-components for a types-only file', () => {
        const source = `
            export type User = {
                id: string;
                name: string;
                email: string;
            };
            export interface Settings {
                theme: 'light' | 'dark';
                language: string;
            }
        `;
        const result = checkReactCompilerWithOxc(source, 'types.ts');
        expect(result.status).toBe('no-components');
        expect(result.errors).toEqual([]);
    });

    it('includes source location in error details', () => {
        const source = `
import {useState} from 'react';
function BadComponent({condition}) {
    if (condition) {
        const [value] = useState(0);
    }
    return <div>Bad</div>;
}
        `.trim();
        const result = checkReactCompilerWithOxc(source, 'BadComponent.tsx');
        expect(result.errors.length).toBeGreaterThan(0);
        const error = result.errors.at(0);
        expect(error).toBeDefined();
        expect(error?.loc).toBeDefined();
        expect(error?.loc?.start.line).toBe(4);
    });
});
