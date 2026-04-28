import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
import Accessibility from '@libs/Accessibility';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {moveSelectionToEnd, scrollToBottom} from '@libs/InputUtils';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useSplashScreenState} from '@src/SplashScreenStateContext';
import useIsInLandscapeMode from './useIsInLandscapeMode';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

type UseAutoFocusInput = {
    inputCallbackRef: (ref: TextInput | null) => void;
    inputRef: RefObject<TextInput | null>;
    cancelAutoFocus: () => void;
};

export default function useAutoFocusInput(isMultiline = false): UseAutoFocusInput {
    const [isInputInitialized, setIsInputInitialized] = useState(false);
    const [isScreenTransitionEnded, setIsScreenTransitionEnded] = useState(false);
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const isPopoverVisible = modal?.willAlertModalBecomeVisible && modal?.isPopover;
    const isInLandscapeMode = useIsInLandscapeMode();
    const isScreenReaderEnabled = Accessibility.useScreenReaderStatus();

    const {splashScreenState} = useSplashScreenState();
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();

    const inputRef = useRef<TextInput | null>(null);
    const transitionEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isAutoFocusCancelledRef = useRef(false);

    const clearTransitionEndTimeout = useCallback(() => {
        if (!transitionEndTimeoutRef.current) {
            return;
        }
        clearTimeout(transitionEndTimeoutRef.current);
        transitionEndTimeoutRef.current = null;
    }, []);

    const cancelAutoFocus = () => {
        isAutoFocusCancelledRef.current = true;
        clearTransitionEndTimeout();
        setIsScreenTransitionEnded(false);
    };

    useEffect(() => {
        if (
            isScreenReaderEnabled ||
            !isScreenTransitionEnded ||
            !isInputInitialized ||
            !inputRef.current ||
            splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN ||
            isPopoverVisible ||
            isInLandscapeMode
        ) {
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
    }, [isScreenReaderEnabled, isMultiline, isScreenTransitionEnded, isInputInitialized, splashScreenState, isPopoverVisible, isInLandscapeMode]);

    useFocusEffect(
        useCallback(() => {
            isAutoFocusCancelledRef.current = false;
            setIsScreenTransitionEnded(false);
            transitionEndTimeoutRef.current = setTimeout(() => {
                if (isAutoFocusCancelledRef.current) {
                    return;
                }
                setIsScreenTransitionEnded(true);
            }, CONST.SCREEN_TRANSITION_END_TIMEOUT);

            const unsubscribeTransitionEnd = navigation.addListener?.('transitionEnd', (event) => {
                if (event?.data?.closing || isAutoFocusCancelledRef.current) {
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
    const {isSidePanelTransitionEnded, shouldHideSidePanel} = useSidePanelState();
    const [wasSidePanelClosed, setWasSidePanelClosed] = useState(false);

    const [prevShouldHide, setPrevShouldHide] = useState(shouldHideSidePanel);
    if (prevShouldHide !== shouldHideSidePanel) {
        setPrevShouldHide(shouldHideSidePanel);
        if (shouldHideSidePanel) {
            setWasSidePanelClosed(true);
        }
    }

    const [prevSidePanelKey, setPrevSidePanelKey] = useState({isSidePanelTransitionEnded, wasSidePanelClosed});
    if (prevSidePanelKey.isSidePanelTransitionEnded !== isSidePanelTransitionEnded || prevSidePanelKey.wasSidePanelClosed !== wasSidePanelClosed) {
        setPrevSidePanelKey({isSidePanelTransitionEnded, wasSidePanelClosed});
        if (wasSidePanelClosed && isSidePanelTransitionEnded) {
            Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => setIsScreenTransitionEnded(isSidePanelTransitionEnded));
        }
    }

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

    return {inputCallbackRef, inputRef, cancelAutoFocus};
}
