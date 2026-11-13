/**
 * The Concierge page of the wide flat navigation. The sidebar lists the Concierge conversations, and the central pane shows
 * the Concierge DM, which starts a new conversation, or the conversation the user picked.
 */
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import {IsInConciergePageContext} from '@hooks/useIsInConciergePage';
import useOnyx from '@hooks/useOnyx';

import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import FreezeWrapper from '@libs/Navigation/AppNavigator/FreezeWrapper';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ConciergeSplitNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import type {ReportScreenProps} from '@pages/inbox/ReportScreen';

import type NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

import React from 'react';

const loadReportScreen = () => require<{default: React.ComponentType<ReportScreenProps>}>('@pages/inbox/ReportScreen').default;
const loadSidebarScreen = () => require<ReactComponentModule>('@pages/concierge/ConciergeSidebarScreen').default;
const Split = createSplitNavigator<ConciergeSplitNavigatorParamList>();

function ConciergeSplitNavigator({route}: PlatformStackScreenProps<TabNavigatorParamList, typeof NAVIGATORS.CONCIERGE_SPLIT_NAVIGATOR>) {
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions(SCREENS.CONCIERGE_SIDEBAR);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    // The page opens on the Concierge DM, so it waits for OpenApp to tell which report that is
    if (!conciergeReportID) {
        return <FullscreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <FreezeWrapper>
            <IsInConciergePageContext.Provider value>
                <Split.Navigator
                    persistentScreens={[SCREENS.CONCIERGE_SIDEBAR]}
                    sidebarScreen={SCREENS.CONCIERGE_SIDEBAR}
                    defaultCentralScreen={SCREENS.REPORT}
                    parentRoute={route}
                    screenOptions={splitNavigatorScreenOptions.centralScreen}
                >
                    <Split.Screen
                        name={SCREENS.CONCIERGE_SIDEBAR}
                        getComponent={loadSidebarScreen}
                        options={splitNavigatorScreenOptions.sidebarScreen}
                    />
                    <Split.Screen
                        name={SCREENS.REPORT}
                        initialParams={{reportID: conciergeReportID}}
                    >
                        {(screenProps: ReportScreenProps) => {
                            const ReportScreen = loadReportScreen();
                            return <ReportScreen {...screenProps} />;
                        }}
                    </Split.Screen>
                </Split.Navigator>
            </IsInConciergePageContext.Provider>
        </FreezeWrapper>
    );
}

export default ConciergeSplitNavigator;
