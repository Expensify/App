/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {CSSProperties, FocusEventHandler, KeyboardEventHandler, MouseEventHandler} from 'react';
import 'react-native';

declare module 'react-native' {
    // Extracted from react-native-web, packages/react-native-web/src/exports/View/types.js
    type NumberOrString = number | string;
    type OverscrollBehaviorValue = 'auto' | 'contain' | 'none';
    type idRef = string;
    type idRefList = idRef | idRef[];

    // https://necolas.github.io/react-native-web/docs/accessibility/#accessibility-props-api
    // Extracted from react-native-web, packages/react-native-web/src/exports/View/types.js
    type AccessibilityProps = {
        'aria-activedescendant'?: idRef;
        'aria-atomic'?: boolean;
        'aria-autocomplete'?: 'none' | 'list' | 'inline' | 'both';
        'aria-busy'?: boolean;
        'aria-checked'?: boolean | 'mixed';
        'aria-colcount'?: number;
        'aria-colindex'?: number;
        'aria-colspan'?: number;
        'aria-controls'?: idRef;
        'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
        'aria-describedby'?: idRef;
        'aria-details'?: idRef;
        'aria-disabled'?: boolean;
        'aria-errormessage'?: idRef;
        'aria-expanded'?: boolean;
        'aria-flowto'?: idRef;
        'aria-haspopup'?: 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | false;
        'aria-hidden'?: boolean;
        'aria-invalid'?: boolean;
        'aria-keyshortcuts'?: string[];
        'aria-label'?: string;
        'aria-labelledby'?: idRef;
        'aria-level'?: number;
        'aria-live'?: 'assertive' | 'none' | 'polite';
        'aria-modal'?: boolean;
        'aria-multiline'?: boolean;
        'aria-multiselectable'?: boolean;
        'aria-orientation'?: 'horizontal' | 'vertical';
        'aria-owns'?: idRef;
        'aria-placeholder'?: string;
        'aria-posinset'?: number;
        'aria-pressed'?: boolean | 'mixed';
        'aria-readonly'?: boolean;
        'aria-required'?: boolean;
        'aria-roledescription'?: string;
        'aria-rowcount'?: number;
        'aria-rowindex'?: number;
        'aria-rowspan'?: number;
        'aria-selected'?: boolean;
        'aria-setsize'?: number;
        'aria-sort'?: 'ascending' | 'descending' | 'none' | 'other';
        'aria-valuemax'?: number;
        'aria-valuemin'?: number;
        'aria-valuenow'?: number;
        'aria-valuetext'?: string;
        role?: string;

        // @deprecated
        accessibilityActiveDescendant?: idRef;
        accessibilityAtomic?: boolean;
        accessibilityAutoComplete?: 'none' | 'list' | 'inline' | 'both';
        accessibilityBusy?: boolean;
        accessibilityChecked?: boolean | 'mixed';
        accessibilityColumnCount?: number;
        accessibilityColumnIndex?: number;
        accessibilityColumnSpan?: number;
        accessibilityControls?: idRefList;
        accessibilityCurrent?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
        accessibilityDescribedBy?: idRefList;
        accessibilityDetails?: idRef;
        accessibilityDisabled?: boolean;
        accessibilityErrorMessage?: idRef;
        accessibilityExpanded?: boolean;
        accessibilityFlowTo?: idRefList;
        accessibilityHasPopup?: 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | false;
        accessibilityHidden?: boolean;
        accessibilityInvalid?: boolean;
        accessibilityKeyShortcuts?: string[];
        accessibilityLabel?: string;
        accessibilityLabelledBy?: idRefList;
        accessibilityLevel?: number;
        accessibilityLiveRegion?: 'assertive' | 'none' | 'polite';
        accessibilityModal?: boolean;
        accessibilityMultiline?: boolean;
        accessibilityMultiSelectable?: boolean;
        accessibilityOrientation?: 'horizontal' | 'vertical';
        accessibilityOwns?: idRefList;
        accessibilityPlaceholder?: string;
        accessibilityPosInSet?: number;
        accessibilityPressed?: boolean | 'mixed';
        accessibilityReadOnly?: boolean;
        accessibilityRequired?: boolean;
        accessibilityRole?: string;
        accessibilityRoleDescription?: string;
        accessibilityRowCount?: number;
        accessibilityRowIndex?: number;
        accessibilityRowSpan?: number;
        accessibilitySelected?: boolean;
        accessibilitySetSize?: number;
        accessibilitySort?: 'ascending' | 'descending' | 'none' | 'other';
        accessibilityValueMax?: number;
        accessibilityValueMin?: number;
        accessibilityValueNow?: number;
        accessibilityValueText?: string;
    };

    // https://necolas.github.io/react-native-web/docs/interactions/#pointerevent-props-api
    // Extracted from react-native-web, packages/react-native-web/src/exports/View/types.js
    // Extracted from @types/react, index.d.ts
    type PointerProps = {
        onClick?: MouseEventHandler;
        onClickCapture?: MouseEventHandler;
        onContextMenu?: MouseEventHandler;
    };

    // TODO: Confirm
    type FocusProps = {
        onBlur?: FocusEventHandler;
        onFocus?: FocusEventHandler;
    };

    // TODO: Confirm
    type KeyboardProps = {
        onKeyDown?: KeyboardEventHandler;
        onKeyDownCapture?: KeyboardEventHandler;
        onKeyUp?: KeyboardEventHandler;
        onKeyUpCapture?: KeyboardEventHandler;
    };

    // type AnimationDirection = 'alternate' | 'alternate-reverse' | 'normal' | 'reverse';
    // type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
    // type AnimationIterationCount = number | 'infinite';
    // type AnimationKeyframes = string | object;
    // type AnimationPlayState = 'paused' | 'running';

    // type AnimationStyles = {
    //     animationDelay?: string | string[];
    //     animationDirection?: AnimationDirection | AnimationDirection[];
    //     animationDuration?: string | string[];
    //     animationFillMode?: AnimationFillMode | AnimationFillMode[];
    //     animationIterationCount?: AnimationIterationCount | AnimationIterationCount[];
    //     animationKeyframes?: AnimationKeyframes | AnimationKeyframes[];
    //     animationPlayState?: AnimationPlayState | AnimationPlayState[];
    //     animationTimingFunction?: string | string[];
    //     transitionDelay?: string | string[];
    //     transitionDuration?: string | string[];
    //     transitionProperty?: string | string[];
    //     transitionTimingFunction?: string | string[];
    // };

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
    interface WebViewProps extends AccessibilityProps, PointerProps, FocusProps, KeyboardProps {
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

    interface ViewStyle extends WebStyle, WebViewStyle {}
    interface TextStyle extends WebStyle {}
    interface ImageStyle extends WebStyle {}
}
