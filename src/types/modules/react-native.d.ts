/* eslint-disable @typescript-eslint/naming-convention */

/* eslint-disable @typescript-eslint/no-empty-interface */

/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {CSSProperties, FocusEventHandler, KeyboardEventHandler, MouseEventHandler, PointerEventHandler, UIEventHandler, WheelEventHandler} from 'react';
import 'react-native';
import {BootSplashModule} from '@libs/BootSplash/types';

declare module 'react-native' {
    // <------ REACT NATIVE WEB (0.19.0) ------>
    // Extracted from react-native-web, packages/react-native-web/src/exports/View/types.js
    type idRef = string;
    type idRefList = idRef | idRef[];

    // https://necolas.github.io/react-native-web/docs/accessibility/#accessibility-props-api
    // Extracted from react-native-web, packages/react-native-web/src/exports/View/types.js
    interface AccessibilityProps {
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
        'aria-keyshortcuts'?: string;
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
        accessibilityLabelledBy?: idRef;
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
    }

    // https://necolas.github.io/react-native-web/docs/interactions/#pointerevent-props-api
    // Extracted properties from react-native-web, packages/react-native-web/src/exports/View/types.js and packages/react-native-web/src/modules/forwardedProps/index.js
    // Extracted types from @types/react, index.d.ts
    interface PointerProps {
        onAuxClick?: MouseEventHandler;
        onClick?: MouseEventHandler;
        onContextMenu?: MouseEventHandler;
        onGotPointerCapture?: PointerEventHandler;
        onLostPointerCapture?: PointerEventHandler;
        onPointerCancel?: PointerEventHandler;
        onPointerDown?: PointerEventHandler;
        onPointerEnter?: PointerEventHandler;
        onPointerMove?: PointerEventHandler;
        onPointerLeave?: PointerEventHandler;
        onPointerOut?: PointerEventHandler;
        onPointerOver?: PointerEventHandler;
        onPointerUp?: PointerEventHandler;
        onMouseDown?: MouseEventHandler;
        onMouseEnter?: MouseEventHandler;
        onMouseLeave?: MouseEventHandler;
        onMouseMove?: MouseEventHandler;
        onMouseOver?: MouseEventHandler;
        onMouseOut?: MouseEventHandler;
        onMouseUp?: MouseEventHandler;
        onScroll?: UIEventHandler;
        onWheel?: WheelEventHandler;
    }

    // https://necolas.github.io/react-native-web/docs/interactions/#responderevent-props-api
    // Extracted from react-native-web, packages/react-native-web/src/modules/useResponderEvents/ResponderTouchHistoryStore.js
    type TouchRecord = {
        currentPageX: number;
        currentPageY: number;
        currentTimeStamp: number;
        previousPageX: number;
        previousPageY: number;
        previousTimeStamp: number;
        startPageX: number;
        startPageY: number;
        startTimeStamp: number;
        touchActive: boolean;
    };

    // https://necolas.github.io/react-native-web/docs/interactions/#responderevent-props-api
    // Extracted from react-native-web, packages/react-native-web/src/modules/useResponderEvents/ResponderTouchHistoryStore.js
    type TouchHistory = Readonly<{
        indexOfSingleActiveTouch: number;
        mostRecentTimeStamp: number;
        numberActiveTouches: number;
        touchBank: TouchRecord[];
    }>;

    // https://necolas.github.io/react-native-web/docs/interactions/#responderevent-props-api
    // Extracted from react-native-web, packages/react-native-web/src/modules/useResponderEvents/createResponderEvent.js
    type ResponderEvent = {
        bubbles: boolean;
        cancelable: boolean;
        currentTarget?: unknown; // changed from "any" to "unknown"
        defaultPrevented?: boolean;
        dispatchConfig: {
            registrationName?: string;
            phasedRegistrationNames?: {
                bubbled: string;
                captured: string;
            };
        };
        eventPhase?: number;
        isDefaultPrevented: () => boolean;
        isPropagationStopped: () => boolean;
        isTrusted?: boolean;
        preventDefault: () => void;
        stopPropagation: () => void;
        nativeEvent: TouchEvent;
        persist: () => void;
        target?: unknown; // changed from "any" to "unknown"
        timeStamp: number;
        touchHistory: TouchHistory;
    };

    // https://necolas.github.io/react-native-web/docs/interactions/#responderevent-props-api
    // Extracted from react-native-web, packages/react-native-web/src/modules/useResponderEvents/ResponderSystem.js
    interface ResponderProps {
        // Direct responder events dispatched directly to responder. Do not bubble.
        onResponderEnd?: (e: ResponderEvent) => void;
        onResponderGrant?: (e: ResponderEvent) => void | boolean;
        onResponderMove?: (e: ResponderEvent) => void;
        onResponderRelease?: (e: ResponderEvent) => void;
        onResponderReject?: (e: ResponderEvent) => void;
        onResponderStart?: (e: ResponderEvent) => void;
        onResponderTerminate?: (e: ResponderEvent) => void;
        onResponderTerminationRequest?: (e: ResponderEvent) => boolean;

        // On pointer down, should this element become the responder?
        onStartShouldSetResponder?: (e: ResponderEvent) => boolean;
        onStartShouldSetResponderCapture?: (e: ResponderEvent) => boolean;

        // On pointer move, should this element become the responder?
        onMoveShouldSetResponder?: (e: ResponderEvent) => boolean;
        onMoveShouldSetResponderCapture?: (e: ResponderEvent) => boolean;

        // On scroll, should this element become the responder? Do no bubble
        onScrollShouldSetResponder?: (e: ResponderEvent) => boolean;
        onScrollShouldSetResponderCapture?: (e: ResponderEvent) => boolean;

        // On text selection change, should this element become the responder?
        onSelectionChangeShouldSetResponder?: (e: ResponderEvent) => boolean;
        onSelectionChangeShouldSetResponderCapture?: (e: ResponderEvent) => boolean;
    }

    // https://necolas.github.io/react-native-web/docs/interactions/#focusevent-props-api
    // Extracted properties from react-native-web, packages/react-native-web/src/exports/View/types.js and packages/react-native-web/src/modules/forwardedProps/index.js
    // Extracted types from @types/react, index.d.ts
    interface FocusProps {
        onBlur?: FocusEventHandler;
        onFocus?: FocusEventHandler;
    }

    // https://necolas.github.io/react-native-web/docs/interactions/#keyboardevent-props-api
    // Extracted properties from react-native-web, packages/react-native-web/src/exports/View/types.js and packages/react-native-web/src/modules/forwardedProps/index.js
    // Extracted types from @types/react, index.d.ts
    interface KeyboardProps {
        onKeyDown?: KeyboardEventHandler;
        onKeyDownCapture?: KeyboardEventHandler;
        onKeyUp?: KeyboardEventHandler;
        onKeyUpCapture?: KeyboardEventHandler;
    }

    /**
     * Shared props
     * Extracted from react-native-web, packages/react-native-web/src/exports/View/types.js
     */
    interface WebSharedProps extends AccessibilityProps, PointerProps, ResponderProps, FocusProps, KeyboardProps {
        dataSet?: Record<string, unknown>;
        href?: string;
        hrefAttrs?: {
            download?: boolean;
            rel?: string;
            target?: string;
        };
        tabIndex?: 0 | -1;
        lang?: string;
    }

    /**
     * View
     * Extracted from react-native-web, packages/react-native-web/src/exports/View/types.js
     */
    interface WebViewProps extends WebSharedProps {
        dir?: 'ltr' | 'rtl';
    }
    interface ViewProps extends WebViewProps {}

    /**
     * Text
     * Extracted from react-native-web, packages/react-native-web/src/exports/Text/types.js
     */
    interface WebTextProps extends WebSharedProps {
        dir?: 'auto' | 'ltr' | 'rtl';
    }
    interface TextProps extends WebTextProps {}

    /**
     * TextInput
     * Extracted from react-native-web, packages/react-native-web/src/exports/TextInput/types.js
     */
    interface WebTextInputProps extends WebSharedProps {
        dir?: 'auto' | 'ltr' | 'rtl';
        disabled?: boolean;
        enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
        readOnly?: boolean;
    }
    interface TextInputProps extends WebTextInputProps {}

    /**
     * Image
     * Extracted from react-native-web, packages/react-native-web/src/exports/Image/types.js
     */
    interface WebImageProps extends WebSharedProps {
        dir?: 'ltr' | 'rtl';
        draggable?: boolean;
    }
    interface ImageProps extends WebImageProps {}

    /**
     * ScrollView
     * Extracted from react-native-web, packages/react-native-web/src/exports/ScrollView/ScrollViewBase.js
     */
    interface WebScrollViewProps extends WebSharedProps {}
    interface ScrollViewProps extends WebScrollViewProps {}

    /**
     * Pressable
     */
    // https://necolas.github.io/react-native-web/docs/pressable/#interactionstate
    // Extracted from react-native-web, packages/react-native-web/src/exports/Pressable/index.js
    interface WebPressableStateCallbackType {
        readonly focused: boolean;
        readonly hovered: boolean;
        readonly pressed: boolean;
    }
    interface PressableStateCallbackType extends WebPressableStateCallbackType {
        readonly isScreenReaderActive: boolean;
        readonly isDisabled: boolean;
    }

    // Extracted from react-native-web, packages/react-native-web/src/exports/Pressable/index.js
    interface WebPressableProps extends WebSharedProps {
        delayPressIn?: number;
        delayPressOut?: number;
        onPressMove?: null | ((event: GestureResponderEvent) => void);
        onPressEnd?: null | ((event: GestureResponderEvent) => void);
    }
    interface PressableProps extends WebPressableProps {}

    /**
     * Styles
     */
    // We extend CSSProperties (alias to "csstype" library) which provides all CSS style properties for Web,
    // but properties that are already defined on RN won't be overrided / augmented.
    interface WebStyle extends CSSProperties {
        // https://necolas.github.io/react-native-web/docs/styling/#non-standard-properties
        // Exclusive to react-native-web, "pointerEvents" already included on RN
        animationKeyframes?: string | Record<string, ViewStyle>;
        writingDirection?: 'auto' | 'ltr' | 'rtl';
        enableBackground?: string;
    }

    interface ViewStyle extends WebStyle {}
    interface TextStyle extends WebStyle {}
    interface ImageStyle extends WebStyle {}
    // <------ REACT NATIVE WEB (0.19.0) ------>

    interface TextInput {
        // Typescript type declaration is missing in React Native for setting text selection.
        setSelection: (start: number, end: number) => void;
    }

    interface NativeModulesStatic {
        BootSplash: BootSplashModule;
    }
}
