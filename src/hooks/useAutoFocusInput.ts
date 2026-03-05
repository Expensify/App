import {useNavigation} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {moveSelectionToEnd, scrollToBottom} from '@libs/InputUtils';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useSplashScreenState} from '@src/SplashScreenStateContext';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useSidePanelState from './useSidePanelState';

type UseAutoFocusInput = {
    inputCallbackRef: (ref: TextInput | null) => void;
    inputRef: RefObject<TextInput | null>;
};

export default function useAutoFocusInput(isMultiline = false): UseAutoFocusInput {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const isPopoverVisible = modal?.willAlertModalBecomeVisible && modal?.isPopover;

    const {splashScreenState} = useSplashScreenState();

    const inputRef = useRef<TextInput | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current || splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN || isPopoverVisible) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const focusTaskHandle = InteractionManager.runAfterInteractions(() => {
            if (inputRef.current && isMultiline) {
                moveSelectionToEnd(inputRef.current);
            }
            isWindowReadyToFocus().then(() => inputRef.current?.focus());
            setIsScreenTransitionEnded(false);
        });

        return () => {
            focusTaskHandle.cancel();
        };
    }, [isMultiline, isScreenTransitionEnded, isInputInitialized, splashScreenState, isPopoverVisible]);

    useEffect(() => {
        const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', (event) => {
            if (event.data.closing) {
                return;
            }
            setIsScreenTransitionEnded(true);
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            setIsScreenTransitionEnded(false);
        });

        return () => {
            unsubscribeTransitionEnd();
            unsubscribeBlur();
        };
    }, [navigation]);

    // Trigger focus when Side Panel transition ends
    const {isSidePanelTransitionEnded, shouldHideSidePanel} = useSidePanelState();
    const prevShouldHideSidePanel = usePrevious(shouldHideSidePanel);
    const wasSidePanelClosedRef = useRef(false);

    useEffect(() => {
        // Track when side panel transitions from visible to hidden
        if (!(shouldHideSidePanel && !prevShouldHideSidePanel)) {
            return;
        }
        wasSidePanelClosedRef.current = true;
    }, [shouldHideSidePanel, prevShouldHideSidePanel]);

    useEffect(() => {
        // Trigger focus when:
        // 1. Side panel was just closed
        // 2. Transition has fully completed
        if (!wasSidePanelClosedRef.current || !isSidePanelTransitionEnded) {
            return;
        }
        wasSidePanelClosedRef.current = false;
        Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => setIsScreenTransitionEnded(isSidePanelTransitionEnded));
    }, [isSidePanelTransitionEnded]);

    const inputCallbackRef = (ref: TextInput | null) => {
        inputRef.current = ref;
        if (isInputInitialized) {
            return;
        }
        if (ref && isMultiline) {
            scrollToBottom(ref);
        }
        setIsInputInitialized(true);
    };

    return {inputCallbackRef, inputRef};
}
