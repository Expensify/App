import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import Navigation, {navigationRef} from '@navigation/Navigation';
import SCREENS from '@src/SCREENS';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Hook that returns a function to check if the currently active route remains the same as the route on which the component was initially rendered.
 * The `isOnInitialRenderedRouteRef` is set to `false` every time the component experiences a 'blur' event,
 * except when opening an attachments modal, which is treated as an exception and does not trigger a reference update because the attachments modal display overlap and we want to use shared VideoPlayer.
 *
 * @return Function that checks if the route where the component was initially rendered matches the current active route.
 */
function useCheckIfRouteHasRemainedUnchanged(videoUrl: string) {
    // Determines whether the component is still rendered on the initially rendered route.
    const isOnInitialRenderedRouteRef = useRef<boolean | undefined>(undefined);
    const navigation = useNavigation();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();

    /**
     * Return true only when on the initially rendered route or the video is currently playing in attachment modal.
     */
    const hasRouteRemainedUnchanged = useCallback(() => {
        if (navigation.isFocused()) {
            return true;
        }

        // If navigating away from the initially rendered route or attachment route
        if (!isOnInitialRenderedRouteRef.current) {
            return false;
        }

        // If on AttachmentModal, only play when the source parameters match videoUrl ensures correct play VideoPlayer share for this one
        const currentRoute = navigationRef.getCurrentRoute();
        if (
            currentRoute?.name === SCREENS.REPORT_ATTACHMENTS &&
            currentRoute?.params &&
            'source' in currentRoute.params &&
            currentRoute.params.source === videoUrl &&
            // Because the video player is shared only on large screens
            // Allow in RHP in cases where we're in RHP on the Search page
            (!shouldUseNarrowLayout || isInNarrowPaneModal)
        ) {
            return true;
        }

        return false;
    }, [shouldUseNarrowLayout, isInNarrowPaneModal, videoUrl, navigation]);

    // Initialize and check if starting with the attachment modal
    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            if (isOnInitialRenderedRouteRef.current !== undefined) {
                return;
            }

            const route = navigationRef.getCurrentRoute();
            // If the app is launched with the attachment route, it will always remain on the report screen.
            // Thus, it can be considered as still being on the rendered route.
            isOnInitialRenderedRouteRef.current = navigation.isFocused() || route?.name === SCREENS.REPORT_ATTACHMENTS;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            isOnInitialRenderedRouteRef.current = true;
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            const route = navigationRef.getCurrentRoute();

            if (route?.name === SCREENS.REPORT_ATTACHMENTS) {
                // Skip route update when attachment modal is opened
                return;
            }

            isOnInitialRenderedRouteRef.current = false;
        });

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation]);

    return hasRouteRemainedUnchanged;
}

export default useCheckIfRouteHasRemainedUnchanged;
