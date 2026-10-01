import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';

import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';

type BackButtonPressOptions = {
    afterTransition?: () => void;
};

/**
 * Leaving the report is more than a `goBack`: the side panel closes in place, and a `backTo` param has to win over
 * the navigation stack. Shared by the report header and by the back button that floats over the report actions once
 * the header has scrolled away, so both leave the report the same way.
 */
function useReportBackButtonPress() {
    const route = useRoute();
    // `backTo` is a route to return to, except for the search report modal, which names the screen instead and is
    // handled by its own branch below.
    const routeParams = route.params as {backTo?: Route | typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT} | undefined;
    const backTo = routeParams?.backTo;

    const isInSidePanel = useIsInSidePanel();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {closeSidePanel} = useSidePanelActions();

    return (prioritizeBackTo = false, options?: BackButtonPressOptions) => {
        if (isInSidePanel) {
            closeSidePanel({afterTransition: options?.afterTransition});
            return;
        }
        if (backTo === SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            Navigation.goBack(undefined, options);
            return;
        }
        if (prioritizeBackTo && backTo) {
            Navigation.goBack(backTo, options);
            return;
        }
        if (isInNarrowPaneModal) {
            Navigation.goBack(undefined, options);
            return;
        }
        if (backTo) {
            Navigation.goBack(backTo, options);
            return;
        }
        Navigation.goBack(undefined, options);
    };
}

export default useReportBackButtonPress;
