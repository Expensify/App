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

import type {ComponentType} from 'react';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import type {WithReportOrNotFoundProps} from './withReportOrNotFound';

import withReportOrNotFound from './withReportOrNotFound';

type WithReportAndPrivateNotesOrNotFoundOnyxProps = {
    /** ID of the current user */
    accountID?: number;
};

type WithReportAndPrivateNotesOrNotFoundProps = WithReportOrNotFoundProps & WithReportAndPrivateNotesOrNotFoundOnyxProps;

type WithReportAndPrivateNotesOrNotFoundImplProps<TProps extends WithReportAndPrivateNotesOrNotFoundProps> = {
    WrappedComponent: ComponentType<TProps>;
    pageTitle: TranslationPaths;
} & Omit<TProps, keyof WithReportAndPrivateNotesOrNotFoundOnyxProps>;

function WithReportAndPrivateNotesOrNotFoundImpl<TProps extends WithReportAndPrivateNotesOrNotFoundProps>({
    WrappedComponent,
    pageTitle,
    ...props
}: WithReportAndPrivateNotesOrNotFoundImplProps<TProps>) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const {route, report, reportLoadingState} = props;
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const accountID = ('accountID' in route.params && route.params.accountID) || '';
    const isPrivateNotesFetchTriggered = reportLoadingState?.isLoadingPrivateNotes !== undefined;
    const prevIsOffline = usePrevious(isOffline);
    const isReconnecting = prevIsOffline && !isOffline;
    const isOtherUserNote = !!accountID && Number(session?.accountID) !== Number(accountID);
    const isPrivateNotesFetchFinished = isPrivateNotesFetchTriggered && !reportLoadingState?.isLoadingPrivateNotes;
    const isPrivateNotesUndefined = accountID ? report?.privateNotes?.[Number(accountID)]?.note === undefined : isEmptyObject(report?.privateNotes);

    useEffect(() => {
        // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
        if ((isPrivateNotesFetchTriggered && !isReconnecting) || isOffline) {
            return;
        }

        getReportPrivateNote(report?.reportID);
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isReconnecting]);

    const shouldShowFullScreenLoadingIndicator = !isPrivateNotesFetchFinished;

    // Show not found view if the report is archived, or if the note is not of current user or if report is a self DM.
    // Don't show not found view if the notes are still loading, or if the notes are non-empty.
    // As notes being empty and not loading is a valid case, show not found view only in offline mode.
    let shouldShowNotFoundPage = isOffline;
    if (isArchivedReport(reportNameValuePairs) || isOtherUserNote || isSelfDM(report)) {
        shouldShowNotFoundPage = true;
    } else if (shouldShowFullScreenLoadingIndicator || !isPrivateNotesUndefined || isReconnecting) {
        shouldShowNotFoundPage = false;
    }

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
            {...(props as unknown as TProps)}
            accountID={session?.accountID}
        />
    );
}

export default function (pageTitle: TranslationPaths) {
    return <TProps extends WithReportAndPrivateNotesOrNotFoundProps>(
        WrappedComponent: ComponentType<TProps>,
    ): React.ComponentType<Omit<TProps, keyof WithReportAndPrivateNotesOrNotFoundOnyxProps>> => {
        function WithReportAndPrivateNotesOrNotFound(props: Omit<TProps, keyof WithReportAndPrivateNotesOrNotFoundOnyxProps>) {
            return (
                <WithReportAndPrivateNotesOrNotFoundImpl
                    WrappedComponent={WrappedComponent}
                    pageTitle={pageTitle}
                    {...props}
                />
            );
        }

        WithReportAndPrivateNotesOrNotFound.displayName = `withReportAndPrivateNotesOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        return withReportOrNotFound()(WithReportAndPrivateNotesOrNotFound);
    };
}

export type {WithReportAndPrivateNotesOrNotFoundProps};
