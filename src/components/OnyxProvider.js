import React from 'react';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';
import ComposeProviders from './ComposeProviders';

// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
const [withNetwork, NetworkProvider] = createOnyxContext(ONYXKEYS.NETWORK);
const [withPersonalDetails, PersonalDetailsProvider] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS);
const [withCurrentDate, CurrentDateProvider] = createOnyxContext(ONYXKEYS.CURRENT_DATE);
const [
    withReportActionsDrafts,
    ReportActionsDraftsProvider,
] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);
const [withReportActions, ReportActionsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
const [withReports, ReportsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT);
const [withBetas, BetasProvider] = createOnyxContext(ONYXKEYS.BETAS);
const [withSession, SessionProvider] = createOnyxContext(ONYXKEYS.SESSION);

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

const OnyxProvider = props => (
    <ComposeProviders
        components={[
            NetworkProvider,
            PersonalDetailsProvider,
            ReportActionsDraftsProvider,
            CurrentDateProvider,
            ReportActionsProvider,
            ReportsProvider,
            BetasProvider,
            SessionProvider,
        ]}
    >
        {props.children}
    </ComposeProviders>
);

OnyxProvider.displayName = 'OnyxProvider';
OnyxProvider.propTypes = propTypes;

export default OnyxProvider;

export {
    withNetwork,
    withPersonalDetails,
    withReportActionsDrafts,
    withCurrentDate,
    withReportActions,
    withReports,
    withBetas,
    withSession,
    SessionProvider,
};
