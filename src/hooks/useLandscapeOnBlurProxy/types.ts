import type {RefObject} from 'react';
import type {FocusEvent} from 'react-native';

type FocusableRef = RefObject<{focus?: () => void} | null>;

type OnBlurHandler = (e: FocusEvent) => void;

type UseLandscapeOnBlurProxy = (inputRef: FocusableRef, onBlur?: OnBlurHandler) => OnBlurHandler | undefined;

export type {FocusableRef, OnBlurHandler, UseLandscapeOnBlurProxy};
