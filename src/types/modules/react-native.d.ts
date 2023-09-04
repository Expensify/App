/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {CSSProperties} from 'react';
import 'react-native';
import {Merge, MergeDeep, OverrideProperties} from 'type-fest';

declare module 'react-native' {
    // interface ViewStyle extends CSSProperties {}
    // interface ViewProps {
    //     style?: number; // Doesn't make any difference
    //     onLayout?: number;
    //     href?: string; // It appear new prop as suggestion
    //     focusable?: string;
    // }
    type NumberOrString = number | string;

    type AnimationDirection = 'alternate' | 'alternate-reverse' | 'normal' | 'reverse';
    type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
    type AnimationIterationCount = number | 'infinite';
    type AnimationKeyframes = string | object;
    type AnimationPlayState = 'paused' | 'running';

    type AnimationStyles = {
        animationDelay?: string | string[];
        animationDirection?: AnimationDirection | AnimationDirection[];
        animationDuration?: string | string[];
        animationFillMode?: AnimationFillMode | AnimationFillMode[];
        animationIterationCount?: AnimationIterationCount | AnimationIterationCount[];
        animationKeyframes?: AnimationKeyframes | AnimationKeyframes[];
        animationPlayState?: AnimationPlayState | AnimationPlayState[];
        animationTimingFunction?: string | string[];
        transitionDelay?: string | string[];
        transitionDuration?: string | string[];
        transitionProperty?: string | string[];
        transitionTimingFunction?: string | string[];
    };

    /**
     * Image
     */
    interface WebImageProps {
        draggable?: boolean;
    }
    interface ImageProps extends WebImageProps {}

    /**
     * Pressable
     */
    interface WebPressableProps {
        delayPressIn?: number;
        delayPressOut?: number;
        onPressMove?: null | ((event: GestureResponderEvent) => void);
        onPressEnd?: null | ((event: GestureResponderEvent) => void);
    }
    interface WebPressableStateCallbackType {
        readonly focused: boolean;
        readonly hovered: boolean;
        readonly pressed: boolean;
    }
    interface PressableProps extends WebPressableProps {}
    interface PressableStateCallbackType extends WebPressableStateCallbackType {}

    /**
     * Text
     */
    interface WebTextProps {
        dataSet?: Record<string, unknown>;
        dir?: 'auto' | 'ltr' | 'rtl';
        href?: string;
        hrefAttrs?: {
            download?: boolean;
            rel?: string;
            target?: string;
        };
        lang?: string;
    }
    interface TextProps extends WebTextProps {}

    /**
     * TextInput
     */
    interface WebTextInputProps {
        dataSet?: Record<string, unknown>;
        dir?: 'auto' | 'ltr' | 'rtl';
        lang?: string;
        disabled?: boolean;
    }
    interface TextInputProps extends WebTextInputProps {}

    /**
     * View
     */
    interface WebViewProps {
        dataSet?: Record<string, unknown>;
        dir?: 'ltr' | 'rtl';
        href?: string;
        hrefAttrs?: {
            download?: boolean;
            rel?: string;
            target?: string;
        };
        tabIndex?: 0 | -1;
    }
    interface ViewProps extends WebViewProps {}

    interface WebStyle {
        wordBreak?: CSSProperties['wordBreak'];
        whiteSpace?: CSSProperties['whiteSpace'];
        visibility?: CSSProperties['visibility'];
        userSelect?: CSSProperties['userSelect'];
        WebkitUserSelect?: CSSProperties['WebkitUserSelect'];
        textUnderlinePosition?: CSSProperties['textUnderlinePosition'];
        textDecorationSkipInk?: CSSProperties['textDecorationSkipInk'];
        cursor?: CSSProperties['cursor'];
        outlineWidth?: CSSProperties['outlineWidth'];
        outlineStyle?: CSSProperties['outlineStyle'];
        boxShadow?: CSSProperties['boxShadow'];
    }

    interface WebViewStyle {
        overscrollBehaviorX?: CSSProperties['overscrollBehaviorX'];
        overflowX?: CSSProperties['overflowX'];
    }

    // interface FlexStyle {
    //     overflow?: string;
    // }
    interface ViewStyle extends WebStyle, WebViewStyle {}
    interface TextStyle extends WebStyle {}
    interface ImageStyle extends WebStyle {}
}

interface A {
    overflow?: string;
}

interface B {
    overflow?: number;
}

declare const a: A;

// interface A extends B {}

interface C extends Omit<A, 'overflow'> {
    overflow?: number;
}
declare const a: C;
