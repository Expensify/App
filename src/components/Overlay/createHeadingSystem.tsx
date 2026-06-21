import React, {createContext, use, useEffectEvent, useLayoutEffect} from 'react';
import type {Context, ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';

type HeadingState = {
    readonly titleId: string;
    readonly descriptionId: string;
    readonly contentId: string;
    readonly hasTitle: boolean;
    readonly hasDescription: boolean;
    readonly registerTitle: () => () => void;
    readonly registerDescription: () => () => void;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TitleProps = {
    style?: StyleProp<TextStyle>;
    level?: HeadingLevel;
    children: ReactNode;
};

type DescriptionProps = {
    style?: StyleProp<TextStyle>;
    children: ReactNode;
};

type HeadingSystem = {
    StateContext: Context<HeadingState | null>;
    Title: (props: TitleProps) => ReactNode;
    Description: (props: DescriptionProps) => ReactNode;
    useRegisteredTitle: () => string;
    useRegisteredDescription: () => string;
};

function createHeadingSystem(name: string): HeadingSystem {
    const StateContext = createContext<HeadingState | null>(null);

    function Title({style, level = 2, children}: TitleProps) {
        const state = use(StateContext);
        if (!state) {
            throw new Error(`<${name}.Title> must be rendered inside <${name}.Content>`);
        }
        // Layout effect so hasTitle flips before paint (aria-labelledby must agree on first frame).
        const register = useEffectEvent(() => state.registerTitle());
        useLayoutEffect(() => register(), []);
        return (
            <Text
                nativeID={state.titleId}
                role="heading"
                aria-level={level}
                style={style}
            >
                {children}
            </Text>
        );
    }

    function Description({style, children}: DescriptionProps) {
        const state = use(StateContext);
        if (!state) {
            throw new Error(`<${name}.Description> must be rendered inside <${name}.Content>`);
        }
        const register = useEffectEvent(() => state.registerDescription());
        useLayoutEffect(() => register(), []);
        return (
            <Text
                nativeID={state.descriptionId}
                style={style}
            >
                {children}
            </Text>
        );
    }

    function useRegisteredTitle(): string {
        const state = use(StateContext);
        if (!state) {
            throw new Error(`useRegisteredTitle (<${name}>) must be called inside <${name}.Content>`);
        }
        const register = useEffectEvent(() => state.registerTitle());
        useLayoutEffect(() => register(), []);
        return state.titleId;
    }

    function useRegisteredDescription(): string {
        const state = use(StateContext);
        if (!state) {
            throw new Error(`useRegisteredDescription (<${name}>) must be called inside <${name}.Content>`);
        }
        const register = useEffectEvent(() => state.registerDescription());
        useLayoutEffect(() => register(), []);
        return state.descriptionId;
    }

    return {StateContext, Title, Description, useRegisteredTitle, useRegisteredDescription};
}

export default createHeadingSystem;
export type {TitleProps, DescriptionProps, HeadingSystem, HeadingState, HeadingLevel};
