import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import usePrevious from '@hooks/usePrevious';
import type {UseLandscapeOnBlurProxy} from './types';

// During a portrait → landscape rotation the input briefly ends up behind the keyboard
// while KeyboardAvoidingView catches up, and native blurs it as a result. When that blur
// fires we re-focus the input after a short delay — long enough for KAV to reposition so
// the input is on-screen again, otherwise the re-focus gets clobbered by the same issue.
const ROTATION_REFOCUS_DELAY_MS = 100;

const useLandscapeOnBlurProxy: UseLandscapeOnBlurProxy = (inputRef, onBlur) => {
    const isInLandscapeMode = useIsInLandscapeMode();
    const prevIsInLandscapeMode = usePrevious(isInLandscapeMode);

    return (e) => {
        if (prevIsInLandscapeMode !== isInLandscapeMode && isInLandscapeMode) {
            setTimeout(() => inputRef.current?.focus?.(), ROTATION_REFOCUS_DELAY_MS);
        }
        onBlur?.(e);
    };
};

export default useLandscapeOnBlurProxy;
