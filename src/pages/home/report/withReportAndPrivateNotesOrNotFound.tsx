import React, {useEffect, useMemo} from 'react';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import * as Report from '@libs/actions/Report';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import LoadingPage from '@pages/LoadingPage';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundOnyxProps, WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type WithReportAndPrivateNotesOrNotFoundOnyxProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<OnyxTypes.Session>;
};

type WithReportAndPrivateNotesOrNotFoundProps = WithReportAndPrivateNotesOrNotFoundOnyxProps & WithReportOrNotFoundProps;

export default function (pageTitle: TranslationPaths) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    return <TProps extends WithReportAndPrivateNotesOrNotFoundProps, TRef>(
        WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
    ): React.ComponentType<Omit<Omit<TProps, keyof WithReportAndPrivateNotesOrNotFoundOnyxProps> & RefAttributes<TRef>, keyof WithReportOrNotFoundOnyxProps>> => {
        // eslint-disable-next-line rulesdir/no-negated-variables
        function WithReportAndPrivateNotesOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
            const {translate} = useLocalize();
            const {isOffline} = useNetwork();
            const {route, report, session} = props;
            const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID ?? -1}`);
            const accountID = ('accountID' in route.params && route.params.accountID) || '';
            const isPrivateNotesFetchTriggered = report.isLoadingPrivateNotes !== undefined;
            const prevIsOffline = usePrevious(isOffline);
            const isReconnecting = prevIsOffline && !isOffline;
            const isOtherUserNote = !!accountID && Number(session?.accountID) !== Number(accountID);
            const isPrivateNotesFetchFinished = isPrivateNotesFetchTriggered && !report.isLoadingPrivateNotes;
            const isPrivateNotesUndefined = accountID ? report?.privateNotes?.[Number(accountID)]?.note === undefined : isEmptyObject(report?.privateNotes);

            useEffect(() => {
                // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
                if ((isPrivateNotesFetchTriggered && !isReconnecting) || isOffline) {
                    return;
                }

                Report.getReportPrivateNote(report.reportID);
                // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- do not add report.isLoadingPrivateNotes to dependencies
            }, [report.reportID, isOffline, isPrivateNotesFetchTriggered, isReconnecting]);

            const shouldShowFullScreenLoadingIndicator = !isPrivateNotesFetchFinished;

            // eslint-disable-next-line rulesdir/no-negated-variables
            const shouldShowNotFoundPage = useMemo(() => {
                // Show not found view if the report is archived, or if the note is not of current user or if report is a self DM.
                if (ReportUtils.isArchivedRoom(report, reportNameValuePairs) || isOtherUserNote || ReportUtils.isSelfDM(report)) {
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
                return <LoadingPage title={translate(pageTitle)} />;
            }

            if (shouldShowNotFoundPage) {
                return <NotFoundPage />;
            }

            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            );
        }

        WithReportAndPrivateNotesOrNotFound.displayName = `withReportAndPrivateNotesOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        return withReportOrNotFound()(
            withOnyx<TProps & RefAttributes<TRef>, WithReportAndPrivateNotesOrNotFoundOnyxProps>({
                session: {
                    key: ONYXKEYS.SESSION,
                },
            })(WithReportAndPrivateNotesOrNotFound),
        );
    };
}

export type {WithReportAndPrivateNotesOrNotFoundProps};
