import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
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

    /** Shows if there was an error when loading report actions */
    hasError?: boolean;

    /** Function to retry if there was an error */
    onRetry?: () => void;
};

function ListBoundaryLoader({
    type,
    isLoadingOlderReportActions = false,
    isLoadingInitialReportActions = false,
    lastReportActionName = '',
    isLoadingNewerReportActions = false,
    hasError = false,
    onRetry,
}: ListBoundaryLoaderProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    // When retrying we want to show the loading state in the retry button so we
    // have this separate state to handle that.
    const [isRetrying, setIsRetrying] = React.useState(false);

    const retry = () => {
        setIsRetrying(true);
        onRetry?.();
    };

    // Reset the retrying state once loading is done.
    useEffect(() => {
        if (isLoadingNewerReportActions || isLoadingOlderReportActions) {
            return;
        }

        setIsRetrying(false);
    }, [isLoadingNewerReportActions, isLoadingOlderReportActions]);

    if (hasError || isRetrying) {
        return (
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.listBoundaryError]}>
                <Text style={styles.listBoundaryErrorText}>{translate('listBoundary.errorMessage')}</Text>
                {!isOffline && (
                    <Button
                        small
                        onPress={retry}
                        text={translate('listBoundary.tryAgain')}
                        isLoading={isRetrying}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT.LIST_BOUNDARY_LOADER_RETRY}
                    />
                )}
            </View>
        );
    }
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
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.listBoundaryLoader]}>
                <ActivityIndicator />
            </View>
        );
    }
}

export default ListBoundaryLoader;
