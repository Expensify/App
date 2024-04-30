import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ListBoundaryLoaderProps = {
    /** type of rendered loader. Can be 'header' or 'footer' */
    type: ValueOf<typeof CONST.LIST_COMPONENTS>;

    /** Shows if we call fetching older report action */
    isLoadingOlderReportActions?: boolean;

    /** Shows if we call initial loading of report action */
    isLoadingInitialReportActions?: boolean;

    /** Shows if we call fetching newer report action */
    isLoadingNewerReportActions?: boolean;

    /** Name of the last report action */
    lastReportActionName?: string;
};

function ListBoundaryLoader({
    type,
    isLoadingOlderReportActions = false,
    isLoadingInitialReportActions = false,
    lastReportActionName = '',
    isLoadingNewerReportActions = false,
}: ListBoundaryLoaderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    // We use two different loading components for the header and footer
    // to reduce the jumping effect when the user is scrolling to the newer report actions
    if (type === CONST.LIST_COMPONENTS.FOOTER) {
        /*
         Ensure that the report chat is not loaded until the beginning.
         This is to avoid displaying the skeleton view above the "created" action in a newly generated optimistic chat or one with not that many comments.
         Additionally, if we are offline and the report is not loaded until the beginning, we assume there are more actions to load;
         Therefore, show the skeleton view even though the actions are not actually loading.
        */
        const isReportLoadedUntilBeginning = lastReportActionName === CONST.REPORT.ACTIONS.TYPE.CREATED;
        const mayLoadMoreActions = !isReportLoadedUntilBeginning && (isLoadingInitialReportActions || isOffline);

        if (isLoadingOlderReportActions || mayLoadMoreActions) {
            return <ReportActionsSkeletonView />;
        }
    }
    if (type === CONST.LIST_COMPONENTS.HEADER && isLoadingNewerReportActions) {
        // applied for a header of the list, i.e. when you scroll to the bottom of the list
        // the styles for android and the rest components are different that's why we use two different components
        return (
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.chatBottomLoader]}>
                <ActivityIndicator
                    color={theme.spinner}
                    size="small"
                />
            </View>
        );
    }
}

ListBoundaryLoader.displayName = 'ListBoundaryLoader';

export default ListBoundaryLoader;
