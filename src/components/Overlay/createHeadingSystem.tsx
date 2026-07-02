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
    /** Style applied to the heading text */
    style?: StyleProp<TextStyle>;

    /** Heading level exposed via `aria-level` (default: 2) */
    level?: HeadingLevel;

    /** Title text */
    children: ReactNode;
};

type DescriptionProps = {
    /** Style applied to the description text */
    style?: StyleProp<TextStyle>;

    /** Description text */
    children: ReactNode;
};

type HeadingSystem = {
    StateContext: Context<HeadingState | null>;
    Title: (props: TitleProps) => ReactNode;
    Description: (props: DescriptionProps) => ReactNode;
    useRegisteredTitle: () => string;
    useRegisteredDescription: () => string;
};

function useRegisterOnMount(register: () => () => void): void {
    const registerEvent = useEffectEvent(register);
    useLayoutEffect(() => registerEvent(), []);
}

function createHeadingSystem(name: string): HeadingSystem {
    const StateContext = createContext<HeadingState | null>(null);

    function Title({style, level = 2, children}: TitleProps) {
        const state = use(StateContext);
        if (!state) {
            throw new Error(`<${name}.Title> must be rendered inside <${name}.Content>`);
        }
        useRegisterOnMount(state.registerTitle);
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
        useRegisterOnMount(state.registerDescription);
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
        useRegisterOnMount(state.registerTitle);
        return state.titleId;
    }

    function useRegisteredDescription(): string {
        const state = use(StateContext);
        if (!state) {
            throw new Error(`useRegisteredDescription (<${name}>) must be called inside <${name}.Content>`);
        }
        useRegisterOnMount(state.registerDescription);
        return state.descriptionId;
    }

    return {StateContext, Title, Description, useRegisteredTitle, useRegisteredDescription};
}

export default createHeadingSystem;
export type {TitleProps, DescriptionProps, HeadingSystem, HeadingState, HeadingLevel};
