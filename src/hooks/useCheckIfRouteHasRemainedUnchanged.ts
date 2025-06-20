import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import Navigation, {navigationRef} from '@navigation/Navigation';
import SCREENS from '@src/SCREENS';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Hook that returns a function to check if the currently active route remains the same as the route on which the component was initially rendered.
 * The `isFocused` is set to `false` every time the component experiences a 'blur' event,
 * except when opening an attachments modal, which is treated as an exception and does not trigger a reference update.
 *
 * @return Function that checks if the route where the component was rendered matches the currently active route.
 */
function useCheckIfRouteHasRemainedUnchanged(videoUrl: string) {
    // Ref stores a value determining whether the component is still rendered on the route.
    // If the value is false, it immediately returns false; if true, it checks whether it is in the attachment modal.
    const hasOnRenderedRouteRef = useRef<boolean | undefined>(undefined);
    const navigation = useNavigation();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();

    const hasRouteRemainedUnchanged = useCallback(() => {
        if (navigation.isFocused()) {
            return true;
        }

        // If navigating outside the rendered route and attachment modal route
        if (!hasOnRenderedRouteRef.current) {
            return false;
        }

        // If on AttachmentModal, only play when the source parameters match videoUrl
        const currentRoute = navigationRef.getCurrentRoute();
        if (
            currentRoute?.name === SCREENS.ATTACHMENTS &&
            currentRoute?.params &&
            'source' in currentRoute.params &&
            currentRoute.params.source === videoUrl &&
            // Because the video player is shared only on desktop
            // Allow in RHP
            (!shouldUseNarrowLayout || isInNarrowPaneModal)
        ) {
            return true;
        }

        return false;
    }, [shouldUseNarrowLayout, isInNarrowPaneModal, videoUrl, navigation]);

    // Initialize and check if starting with the attachment modal
    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            if (hasOnRenderedRouteRef.current !== undefined) {
                return;
            }

            const route = navigationRef.getCurrentRoute();
            // If the app is opened via the attachment route, it will always remain on the report screen.
            // Thus, it can be considered as still being on the rendered route.
            hasOnRenderedRouteRef.current = route?.name === SCREENS.ATTACHMENTS;
        });
    }, []);

    // Update the route reference on 'blur' events, except when opening attachments modal
    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            hasOnRenderedRouteRef.current = true;
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            const route = navigationRef.getCurrentRoute();

            if (route?.name === SCREENS.ATTACHMENTS) {
                // Skip route update when attachment modal is opened
                return;
            }

            hasOnRenderedRouteRef.current = false;
        });

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation]);

    return hasRouteRemainedUnchanged;
}

export default useCheckIfRouteHasRemainedUnchanged;
