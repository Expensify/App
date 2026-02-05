import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {moveSelectionToEnd, scrollToBottom} from '@libs/InputUtils';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useSplashScreenState} from '@src/SplashScreenStateContext';
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

    const {splashScreenState} = useSplashScreenState();
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();

    const inputRef = useRef<TextInput | null>(null);
    const transitionEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearTransitionEndTimeout = useCallback(() => {
        if (!transitionEndTimeoutRef.current) {
            return;
        }
        clearTimeout(transitionEndTimeoutRef.current);
        transitionEndTimeoutRef.current = null;
    }, []);

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

    useFocusEffect(
        useCallback(() => {
            setIsScreenTransitionEnded(false);
            transitionEndTimeoutRef.current = setTimeout(() => {
                setIsScreenTransitionEnded(true);
            }, CONST.SCREEN_TRANSITION_END_TIMEOUT);

            const unsubscribeTransitionEnd = navigation.addListener?.('transitionEnd', (event) => {
                if (event?.data?.closing) {
                    return;
                }
                clearTransitionEndTimeout();
                setIsScreenTransitionEnded(true);
            });
            return () => {
                setIsScreenTransitionEnded(false);
                clearTransitionEndTimeout();
                if (unsubscribeTransitionEnd) {
                    unsubscribeTransitionEnd();
                }
            };
        }, [clearTransitionEndTimeout, navigation]),
    );

    // Trigger focus when Side Panel transition ends
    const {isSidePanelTransitionEnded, shouldHideSidePanel} = useSidePanel();
    const prevShouldHideSidePanel = usePrevious(shouldHideSidePanel);
    const [wasSidePanelClosed, setWasSidePanelClosed] = useState(false);

    useEffect(() => {
        // Track when side panel transitions from visible to hidden
        if (!(shouldHideSidePanel && !prevShouldHideSidePanel)) {
            return;
        }
        setWasSidePanelClosed(true);
    }, [shouldHideSidePanel, prevShouldHideSidePanel]);

    useEffect(() => {
        // Trigger focus when:
        // 1. Side panel was just closed
        // 2. Transition has fully completed
        if (!wasSidePanelClosed || !isSidePanelTransitionEnded) {
            return;
        }
        setWasSidePanelClosed(true);
        Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => setIsScreenTransitionEnded(isSidePanelTransitionEnded));
    }, [isSidePanelTransitionEnded, wasSidePanelClosed]);

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
