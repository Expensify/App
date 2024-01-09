import React, {useEffect, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useNetwork from '@hooks/useNetwork';
import * as Report from '@libs/actions/Report';
import compose from '@libs/compose';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withReportOrNotFound from './withReportOrNotFound';
import type {WithReportOrNotFoundOnyxProps, WithReportOrNotFoundProps} from './withReportOrNotFound';

type WithReportAndPrivateNotesOrNotFoundOnyxProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<OnyxTypes.Session>;
};

type WithReportAndPrivateNotesOrNotFoundProps = WithReportAndPrivateNotesOrNotFoundOnyxProps & WithReportOrNotFoundProps;

export default function <TProps extends WithReportAndPrivateNotesOrNotFoundProps, TRef>(
    WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>,
): React.ComponentType<Omit<Omit<TProps & React.RefAttributes<TRef>, keyof WithReportAndPrivateNotesOrNotFoundOnyxProps>, keyof WithReportOrNotFoundOnyxProps>> {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportAndPrivateNotesOrNotFound(props: TProps, ref: React.ForwardedRef<TRef>) {
        const {route, report, session} = props;
        const accountID = Number(route.params.accountID);
        const isPrivateNotesFetchTriggered = report?.isLoadingPrivateNotes !== undefined;

        const {isOffline} = useNetwork();

        useEffect(() => {
            // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
            if (isPrivateNotesFetchTriggered || isOffline) {
                return;
            }

            Report.getReportPrivateNote(report?.reportID ?? '');
            // eslint-disable-next-line react-hooks/exhaustive-deps -- do not add report.isLoadingPrivateNotes to dependencies
        }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered]);

        const isPrivateNotesEmpty = accountID ? !report?.privateNotes?.[accountID]?.note : isEmptyObject(report?.privateNotes);
        const shouldShowFullScreenLoadingIndicator = !isPrivateNotesFetchTriggered || (isPrivateNotesEmpty && report.isLoadingPrivateNotes);

        // eslint-disable-next-line rulesdir/no-negated-variables
        const shouldShowNotFoundPage = useMemo(() => {
            // Show not found view if the report is archived, or if the note is not of current user.
            if (ReportUtils.isArchivedRoom(report) || (accountID && Number(session?.accountID) !== Number(accountID))) {
                return true;
            }

            // Don't show not found view if the notes are still loading, or if the notes are non-empty.
            if (!!shouldShowFullScreenLoadingIndicator || !isPrivateNotesEmpty) {
                return false;
            }

            // As notes being empty and not loading is a valid case, show not found view only in offline mode.
            return isOffline;
        }, [report, isOffline, accountID, session?.accountID, isPrivateNotesEmpty, shouldShowFullScreenLoadingIndicator]);

        if (shouldShowFullScreenLoadingIndicator) {
            return <FullScreenLoadingIndicator />;
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

    return compose(
        withOnyx<TProps & React.RefAttributes<TRef>, WithReportAndPrivateNotesOrNotFoundOnyxProps>({
            session: {
                key: ONYXKEYS.SESSION,
            },
        }),
        withReportOrNotFound(),
    )(WithReportAndPrivateNotesOrNotFound);
}
