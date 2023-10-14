import React, {useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import reportPropTypes from '../../reportPropTypes';
import withReportOrNotFound from './withReportOrNotFound';
import * as Report from '../../../libs/actions/Report';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import {withNetwork} from '../../../components/OnyxProvider';
import compose from '../../../libs/compose';
import * as ReportUtils from '../../../libs/ReportUtils';
import networkPropTypes from '../../../components/networkPropTypes';
import ONYXKEYS from '../../../ONYXKEYS';

export default function (WrappedComponent) {
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
            /** Currently logged in user accountID */
            accountID: PropTypes.number,
        }),

        route: PropTypes.shape({
            /** Params from the URL path */
            params: PropTypes.shape({
                /** reportID and accountID passed via route: /r/:reportID/notes */
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

    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportAndPrivateNotesOrNotFound(props) {
        const {route, report, network, session} = props;
        const accountID = route.params.accountID;
        const isLoadingPrivateNotes = report.isLoadingPrivateNotes;

        useEffect(() => {
            if (network.isOffline && report.isLoadingPrivateNotes) {
                return;
            }

            Report.getReportPrivateNote(report.reportID);
            // eslint-disable-next-line react-hooks/exhaustive-deps -- do not add isLoadingPrivateNotes to dependencies
        }, [report.reportID, network.isOffline]);

        const isPrivateNotesEmpty = accountID ? _.isEmpty(lodashGet(report, ['privateNotes', accountID, 'note'], '')) : _.isEmpty(report.privateNotes);
        const shouldShowFullScreenLoadingIndicator = isLoadingPrivateNotes !== false && isPrivateNotesEmpty;

        // eslint-disable-next-line rulesdir/no-negated-variables
        const shouldShowNotFoundPage = useMemo(() => {
            // Show not found view if the report is archived, or if the note is not of current user.
            if (ReportUtils.isArchivedRoom(report) || (accountID && Number(session.accountID) !== Number(accountID))) {
                return true;
            }

            // Don't show not found view if the notes are still loading, or if the notes are non-empty.
            if (isLoadingPrivateNotes !== false || !isPrivateNotesEmpty) {
                return false;
            }

            // As notes are empty and not loading, show not found view in case account id is present.
            // In case account id is not present, it's a valid case for user to not have private notes, so show not found view only if user is offline.
            return accountID || network.isOffline;
        }, [report, network.isOffline, accountID, session.accountID, isPrivateNotesEmpty, isLoadingPrivateNotes]);

        if (shouldShowNotFoundPage) {
            return <NotFoundPage />;
        }

        if (shouldShowFullScreenLoadingIndicator) {
            return <FullScreenLoadingIndicator />;
        }

        const rest = _.omit(props, ['forwardedRef']);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={props.forwardedRef}
            />
        );
    }

    WithReportAndPrivateNotesOrNotFound.propTypes = propTypes;
    WithReportAndPrivateNotesOrNotFound.defaultProps = defaultProps;
    WithReportAndPrivateNotesOrNotFound.displayName = `withReportAndPrivateNotesOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const withReportAndPrivateNotesOrNotFound = React.forwardRef((props, ref) => (
        <WithReportAndPrivateNotesOrNotFound
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    return compose(
        withReportOrNotFound,
        withOnyx({
            session: {
                key: ONYXKEYS.SESSION,
            },
        }),
        withNetwork(),
    )(withReportAndPrivateNotesOrNotFound);
}
