import {createContext, use} from 'react';

function createContextNamespace(parentName: string) {
    return function createStrict<T>(localName?: string) {
        const Ctx = createContext<T | null>(null);
        Ctx.displayName = localName ? `${parentName}.${localName}` : parentName;

        function useStrictContext(consumerName: string): T {
            const value = use(Ctx);
            if (value === null) {
                throw new Error(`${consumerName} must be used inside <${parentName}>.`);
            }
            return value;
        }

        return [Ctx, useStrictContext] as const;
    };
}

export default createContextNamespace;
