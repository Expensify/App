import React, {useEffect, useMemo} from 'react';
import type {ComponentType} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {getReportPrivateNote} from '@libs/actions/Report';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import Navigation from '@libs/Navigation/Navigation';
import {isArchivedReport, isSelfDM} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import LoadingPage from '@pages/LoadingPage';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type WithReportAndPrivateNotesOrNotFoundOnyxProps = {
    /** ID of the current user */
    accountID?: number;
};

type WithReportAndPrivateNotesOrNotFoundProps = WithReportOrNotFoundProps & WithReportAndPrivateNotesOrNotFoundOnyxProps;

export default function (pageTitle: TranslationPaths) {
    return <TProps extends WithReportAndPrivateNotesOrNotFoundProps>(
        WrappedComponent: ComponentType<TProps>,
    ): React.ComponentType<Omit<TProps, keyof WithReportAndPrivateNotesOrNotFoundOnyxProps>> => {
        // eslint-disable-next-line rulesdir/no-negated-variables
        function WithReportAndPrivateNotesOrNotFound(props: Omit<TProps, keyof WithReportAndPrivateNotesOrNotFoundOnyxProps>) {
            const {translate} = useLocalize();
            const {isOffline} = useNetwork();
            const [session] = useOnyx(ONYXKEYS.SESSION);
            const {route, report, reportMetadata} = props;
            const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
            const accountID = ('accountID' in route.params && route.params.accountID) || '';
            const isPrivateNotesFetchTriggered = reportMetadata?.isLoadingPrivateNotes !== undefined;
            const prevIsOffline = usePrevious(isOffline);
            const isReconnecting = prevIsOffline && !isOffline;
            const isOtherUserNote = !!accountID && Number(session?.accountID) !== Number(accountID);
            const isPrivateNotesFetchFinished = isPrivateNotesFetchTriggered && !reportMetadata.isLoadingPrivateNotes;
            const isPrivateNotesUndefined = accountID ? report?.privateNotes?.[Number(accountID)]?.note === undefined : isEmptyObject(report?.privateNotes);

            useEffect(() => {
                // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
                if ((isPrivateNotesFetchTriggered && !isReconnecting) || isOffline) {
                    return;
                }

                getReportPrivateNote(report?.reportID);
                // eslint-disable-next-line react-hooks/exhaustive-deps -- do not add report.isLoadingPrivateNotes to dependencies
            }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isReconnecting]);

            const shouldShowFullScreenLoadingIndicator = !isPrivateNotesFetchFinished;

            // eslint-disable-next-line rulesdir/no-negated-variables
            const shouldShowNotFoundPage = useMemo(() => {
                // Show not found view if the report is archived, or if the note is not of current user or if report is a self DM.
                if (isArchivedReport(reportNameValuePairs) || isOtherUserNote || isSelfDM(report)) {
                    return true;
                }

                // Don't show not found view if the notes are still loading, or if the notes are non-empty.
                if (shouldShowFullScreenLoadingIndicator || !isPrivateNotesUndefined || isReconnecting) {
                    return false;
                }

                // As notes being empty and not loading is a valid case, show not found view only in offline mode.
                return isOffline;
            }, [report, isOtherUserNote, shouldShowFullScreenLoadingIndicator, isPrivateNotesUndefined, isReconnecting, isOffline, reportNameValuePairs]);

            if (shouldShowFullScreenLoadingIndicator) {
                if (isOffline) {
                    return (
                        <ScreenWrapper
                            shouldEnableMaxHeight
                            includeSafeAreaPaddingBottom
                            testID="PrivateNotesOfflinePage"
                        >
                            <HeaderWithBackButton
                                title={translate('privateNotes.title')}
                                onBackButtonPress={() => Navigation.goBack()}
                                shouldShowBackButton
                                onCloseButtonPress={() => Navigation.dismissModal()}
                            />
                            <FullPageOfflineBlockingView>
                                <View />
                            </FullPageOfflineBlockingView>
                        </ScreenWrapper>
                    );
                }
                return <LoadingPage title={translate(pageTitle)} />;
            }

            if (shouldShowNotFoundPage) {
                return <NotFoundPage />;
            }

            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(props as TProps)}
                    accountID={session?.accountID}
                />
            );
        }

        WithReportAndPrivateNotesOrNotFound.displayName = `withReportAndPrivateNotesOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        return withReportOrNotFound()(WithReportAndPrivateNotesOrNotFound);
    };
}

export type {WithReportAndPrivateNotesOrNotFoundProps};
