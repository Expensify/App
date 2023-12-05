import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import * as Report from '@libs/actions/Report';
import compose from '@libs/compose';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import reportPropTypes from '@pages/reportPropTypes';
import ONYXKEYS from '@src/ONYXKEYS';
import withReportOrNotFound from './withReportOrNotFound';

const propTypes = {
    /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
     * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
    forwardedRef: PropTypes.func,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** accountID of currently logged in user */
        accountID: PropTypes.number,
    }),

    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** reportID and accountID passed via route: /r/:reportID/notes/:accountID */
            reportID: PropTypes.string,
            accountID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    forwardedRef: () => {},
    report: {},
    session: {
        accountID: null,
    },
};

export default function (WrappedComponent) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportAndPrivateNotesOrNotFound({forwardedRef, ...props}) {
        const {route, report, network, session} = props;
        const accountID = route.params.accountID;
        const isPrivateNotesFetchTriggered = !_.isUndefined(report.isLoadingPrivateNotes);

        useEffect(() => {
            // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
            if (isPrivateNotesFetchTriggered || network.isOffline) {
                return;
            }

            Report.getReportPrivateNote(report.reportID);
            // eslint-disable-next-line react-hooks/exhaustive-deps -- do not add report.isLoadingPrivateNotes to dependencies
        }, [report.reportID, network.isOffline, isPrivateNotesFetchTriggered]);

        const isPrivateNotesEmpty = accountID ? _.isEmpty(lodashGet(report, ['privateNotes', accountID, 'note'], '')) : _.isEmpty(report.privateNotes);
        const shouldShowFullScreenLoadingIndicator = !isPrivateNotesFetchTriggered || (isPrivateNotesEmpty && report.isLoadingPrivateNotes);

        // eslint-disable-next-line rulesdir/no-negated-variables
        const shouldShowNotFoundPage = useMemo(() => {
            // Show not found view if the report is archived, or if the note is not of current user.
            if (ReportUtils.isArchivedRoom(report) || (accountID && Number(session.accountID) !== Number(accountID))) {
                return true;
            }

            // Don't show not found view if the notes are still loading, or if the notes are non-empty.
            if (shouldShowFullScreenLoadingIndicator || !isPrivateNotesEmpty) {
                return false;
            }

            // As notes being empty and not loading is a valid case, show not found view only in offline mode.
            return network.isOffline;
        }, [report, network.isOffline, accountID, session.accountID, isPrivateNotesEmpty, shouldShowFullScreenLoadingIndicator]);

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
                ref={forwardedRef}
            />
        );
    }

    WithReportAndPrivateNotesOrNotFound.propTypes = propTypes;
    WithReportAndPrivateNotesOrNotFound.defaultProps = defaultProps;
    WithReportAndPrivateNotesOrNotFound.displayName = `withReportAndPrivateNotesOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const WithReportAndPrivateNotesOrNotFoundWithRef = React.forwardRef((props, ref) => (
        <WithReportAndPrivateNotesOrNotFound
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithReportAndPrivateNotesOrNotFoundWithRef.displayName = 'WithReportAndPrivateNotesOrNotFoundWithRef';

    return compose(
        withReportOrNotFound(),
        withOnyx({
            session: {
                key: ONYXKEYS.SESSION,
            },
        }),
        withNetwork(),
    )(WithReportAndPrivateNotesOrNotFoundWithRef);
}
