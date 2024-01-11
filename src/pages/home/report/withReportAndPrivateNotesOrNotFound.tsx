import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {useEffect, useMemo} from 'react';
import {type OnyxEntry, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import * as Report from '@libs/actions/Report';
import compose from '@libs/compose';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import LoadingPage from '@pages/LoadingPage';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type WithReportAndPrivateNotesOrNotFoundOnyxProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<OnyxTypes.Session>;
};

type WithReportAndPrivateNotesOrNotFoundProps = WithReportAndPrivateNotesOrNotFoundOnyxProps & WithReportOrNotFoundProps;

export default function <TProps extends WithReportAndPrivateNotesOrNotFoundProps, TRef>(pageTitle: TranslationPaths) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    return (WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) => {
        // eslint-disable-next-line rulesdir/no-negated-variables
        function WithReportAndPrivateNotesOrNotFound(props: TProps & {forwardedRef: ForwardedRef<TRef>}) {
            const {translate} = useLocalize();
            const network = useNetwork();
            const {route, report, session, forwardedRef} = props;
            const accountID = route.params.accountID;
            const isPrivateNotesFetchTriggered = report?.isLoadingPrivateNotes !== undefined;
            const prevIsOffline = usePrevious(network.isOffline);
            const isReconnecting = prevIsOffline && !network.isOffline;
            const isOtherUserNote = !!accountID && Number(session?.accountID) !== Number(accountID);
            const isPrivateNotesEmpty = accountID ? !report?.privateNotes?.[Number(accountID)].note : Object.keys(report?.privateNotes ?? {}).length === 0;

            useEffect(() => {
                // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
                if ((isPrivateNotesFetchTriggered && !isReconnecting) || network.isOffline) {
                    return;
                }

                Report.getReportPrivateNote(report?.reportID);
                // eslint-disable-next-line react-hooks/exhaustive-deps -- do not add report.isLoadingPrivateNotes to dependencies
            }, [report?.reportID, network.isOffline, isPrivateNotesFetchTriggered, isReconnecting]);

            const shouldShowFullScreenLoadingIndicator = !isPrivateNotesFetchTriggered || (isPrivateNotesEmpty && (report?.isLoadingPrivateNotes ?? !isOtherUserNote));

            // eslint-disable-next-line rulesdir/no-negated-variables
            const shouldShowNotFoundPage = useMemo(() => {
                // Show not found view if the report is archived, or if the note is not of current user.
                if (ReportUtils.isArchivedRoom(report) || (accountID && Number(session?.accountID) !== Number(accountID))) {
                    return true;
                }

                // Don't show not found view if the notes are still loading, or if the notes are non-empty.
                if (shouldShowFullScreenLoadingIndicator || !isPrivateNotesEmpty || isReconnecting) {
                    return false;
                }

                // As notes being empty and not loading is a valid case, show not found view only in offline mode.
                return network.isOffline;
            }, [report, network.isOffline, accountID, session?.accountID, isPrivateNotesEmpty, shouldShowFullScreenLoadingIndicator, isReconnecting]);

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
                    ref={forwardedRef}
                />
            );
        }

        WithReportAndPrivateNotesOrNotFound.displayName = `withReportAndPrivateNotesOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        // eslint-disable-next-line rulesdir/no-negated-variables
        const WithReportAndPrivateNotesOrNotFoundWithRef = React.forwardRef((props: TProps, ref: ForwardedRef<TRef>) => (
            <WithReportAndPrivateNotesOrNotFound
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                forwardedRef={ref}
            />
        ));

        return compose(
            withOnyx<TProps, WithReportAndPrivateNotesOrNotFoundOnyxProps>({
                session: {
                    key: ONYXKEYS.SESSION,
                },
            }),
            withReportOrNotFound(),
        )(WithReportAndPrivateNotesOrNotFoundWithRef);
    };
}
