import {checkReactCompilerCompliance} from '../../scripts/react-compiler-compliance-check';

describe('checkReactCompilerCompliance', () => {
    it('returns compiled for a simple component', () => {
        const source = `
            function MyComponent() {
                return <div>Hello</div>;
            }
        `;
        expect(checkReactCompilerCompliance(source, 'MyComponent.tsx')).toBe('compiled');
    });

    it('returns compiled for a hook that compiles', () => {
        const source = `
            import {useState} from 'react';
            function useMyHook() {
                const [value, setValue] = useState(0);
                return value;
            }
        `;
        expect(checkReactCompilerCompliance(source, 'useMyHook.ts')).toBe('compiled');
    });

    it('returns failed for a component with a Rules of React violation', () => {
        const source = `
            import {useState} from 'react';
            function BadComponent({condition}) {
                if (condition) {
                    const [value] = useState(0);
                }
                return <div>Bad</div>;
            }
        `;
        expect(checkReactCompilerCompliance(source, 'BadComponent.tsx')).toBe('failed');
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
        expect(checkReactCompilerCompliance(source, 'mathUtils.ts')).toBe('no-components');
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
        expect(checkReactCompilerCompliance(source, 'types.ts')).toBe('no-components');
    });
});
