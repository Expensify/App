import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {moveSelectionToEnd, scrollToBottom} from '@libs/InputUtils';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useSidePanel from './useSidePanel';

type UseAutoFocusInput = {
    inputCallbackRef: (ref: TextInput | null) => void;
    inputRef: RefObject<TextInput | null>;
};

export default function useAutoFocusInput(isMultiline = false): UseAutoFocusInput {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);
    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: true});
    const isPopoverVisible = modal?.willAlertModalBecomeVisible && modal?.isPopover;

    const {splashScreenState} = useSplashScreenStateContext();

    const inputRef = useRef<TextInput | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current || splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN || isPopoverVisible) {
            return;
        }
        // eslint-disable-next-line deprecation/deprecation
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

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                setIsScreenTransitionEnded(true);
            }, CONST.ANIMATED_TRANSITION);
            return () => {
                setIsScreenTransitionEnded(false);
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    // Trigger focus when Side Panel transition ends
    const {isSidePanelTransitionEnded, shouldHideSidePanel} = useSidePanel();
    const prevShouldHideSidePanel = usePrevious(shouldHideSidePanel);
    useEffect(() => {
        if (!shouldHideSidePanel || prevShouldHideSidePanel) {
            return;
        }

        Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => setIsScreenTransitionEnded(isSidePanelTransitionEnded));
    }, [isSidePanelTransitionEnded, shouldHideSidePanel, prevShouldHideSidePanel]);

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
