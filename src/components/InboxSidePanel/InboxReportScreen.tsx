import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {SidePanelActionsContext, SidePanelStateContext} from '@components/SidePanel/SidePanelContextProvider';
import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useSidePanelState from '@hooks/useSidePanelState';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import ReportScreen from '@pages/inbox/ReportScreen';
import type SCREENS from '@src/SCREENS';

// A timestamp far enough in the past that all chat messages appear as "current session",
// bypassing the Concierge side-panel session filter in ReportActionsView.
const INBOX_SESSION_START = '2000-01-01T00:00:00.000+00:00';

type InboxStackParamList = {
    InboxList: undefined;
    InboxReport: {reportID: string};
};

type ReportScreenProps = PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>;

function InboxReportScreen({navigation}: {navigation: ReportScreenProps['navigation']}) {
    const localNavigation = useNavigation<StackNavigationProp<InboxStackParamList>>();
    const route = useRoute<RouteProp<InboxStackParamList, 'InboxReport'>>();

    const goBack = useCallback(() => localNavigation.goBack(), [localNavigation]);

    const sidePanelActions = useMemo(
        () => ({
            openSidePanel: () => {},
            closeSidePanel: goBack,
        }),
        [goBack],
    );

    const globalSidePanelState = useSidePanelState();
    const sidePanelState = useMemo(() => ({...globalSidePanelState, sessionStartTime: INBOX_SESSION_START}), [globalSidePanelState]);

    // Cast to the expected type — prototype bridge between our local stack and ReportScreen's navigator type.
    const reportScreenRoute = route as unknown as ReportScreenProps['route'];

    return (
        <SidePanelStateContext.Provider value={sidePanelState}>
            <IsInSidePanelContext.Provider value>
                <SidePanelActionsContext.Provider value={sidePanelActions}>
                    <ReportScreen
                        route={reportScreenRoute}
                        navigation={navigation}
                    />
                </SidePanelActionsContext.Provider>
            </IsInSidePanelContext.Provider>
        </SidePanelStateContext.Provider>
    );
}

export default InboxReportScreen;
