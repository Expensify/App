import type {RefObject} from 'react';
import type {FocusEvent} from 'react-native';

type FocusableRef = RefObject<{focus?: () => void} | null>;

type OnBlurHandler = (e: FocusEvent) => void;

type UseLandscapeOnBlurProxy = (inputRef: FocusableRef, onBlur?: OnBlurHandler) => OnBlurHandler | undefined;

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {UseLandscapeOnBlurProxy};
