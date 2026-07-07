import {checkReactCompilerCompliance} from '../../scripts/react-compiler-compliance-check';

describe('checkReactCompilerCompliance', () => {
    it('returns compiled for a simple component', () => {
        const source = `
            function MyComponent() {
                return <div>Hello</div>;
            }
        `;
        const result = checkReactCompilerCompliance(source, 'MyComponent.tsx');
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
        const result = checkReactCompilerCompliance(source, 'useMyHook.ts');
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
        const result = checkReactCompilerCompliance(source, 'BadComponent.tsx');
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
        const result = checkReactCompilerCompliance(source, 'mathUtils.ts');
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
        const result = checkReactCompilerCompliance(source, 'types.ts');
        expect(result.status).toBe('no-components');
        expect(result.errors).toEqual([]);
    });

    it('includes function location in error details', () => {
        const source = `
import {useState} from 'react';
function BadComponent({condition}) {
    if (condition) {
        const [value] = useState(0);
    }
    return <div>Bad</div>;
}
        `.trim();
        const result = checkReactCompilerCompliance(source, 'BadComponent.tsx');
        expect(result.errors.length).toBeGreaterThan(0);
        const error = result.errors.at(0);
        expect(error).toBeDefined();
        expect(error?.fnLoc).toBeDefined();
        expect(error?.fnLoc?.start.line).toBe(2);
    });
});
