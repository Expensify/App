import {useNavigation} from '@react-navigation/native';
import type {RefObject} from 'react';
import {useEffect, useRef} from 'react';
import type Text from '@components/Text';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';

/**
 * Focuses the dialog title element after the RHP transition completes (web only).
 * Uses the transitionEnd navigation event with a fallback timeout to ensure
 * VoiceOver captures the correct element position after animation settles.
 */
function useDialogTitleFocus(titleRef: RefObject<React.ComponentRef<typeof Text> | null>, isInsideDialog: boolean) {
    const hasInitiallyFocusedRef = useRef(false);
    const navigation = useNavigation<PlatformStackNavigationProp<RootNavigatorParamList>>();

    useEffect(() => {
        if (!isInsideDialog || hasInitiallyFocusedRef.current) {
            return;
        }

        const focusTitle = () => {
            if (hasInitiallyFocusedRef.current) {
                return;
            }
            hasInitiallyFocusedRef.current = true;
            (titleRef.current as unknown as HTMLElement)?.focus();
        };

        // Fallback timeout in case transitionEnd doesn't fire
        const timeout = setTimeout(focusTitle, CONST.SCREEN_TRANSITION_END_TIMEOUT);

        const unsubscribe = navigation.addListener?.('transitionEnd', (event) => {
            if (event?.data?.closing) {
                return;
            }
            clearTimeout(timeout);
            focusTitle();
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe?.();
        };
    }, [isInsideDialog, titleRef, navigation]);
}

export default useDialogTitleFocus;
