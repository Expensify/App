import {createContext, use, useEffectEvent, useLayoutEffect, useState} from 'react';
import type {Context} from 'react';

type LayoutState = {
    readonly hasEdgeToEdge: boolean;
    readonly registerEdgeToEdge: () => () => void;
};

const ModalLayoutContext: Context<LayoutState | null> = createContext<LayoutState | null>(null);

function useLayoutState(): LayoutState {
    const [edgeToEdgeCount, setEdgeToEdgeCount] = useState(0);

    const registerEdgeToEdge = () => {
        setEdgeToEdgeCount((count) => count + 1);
        return () => setEdgeToEdgeCount((count) => count - 1);
    };

    return {
        hasEdgeToEdge: edgeToEdgeCount > 0,
        registerEdgeToEdge,
    };
}

function EdgeToEdge(): null {
    const state = use(ModalLayoutContext);
    if (!state) {
        throw new Error('<Modal.EdgeToEdge> must be rendered inside <Modal.Content>');
    }
    const register = useEffectEvent(() => state.registerEdgeToEdge());
    useLayoutEffect(() => register(), []);
    return null;
}

export {ModalLayoutContext, useLayoutState, EdgeToEdge};
export type {LayoutState};
