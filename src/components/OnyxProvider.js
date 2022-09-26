import React from 'react';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';
import ComposeProviders from './ComposeProviders';

// Set up any providers for individual keys. This should only be used in cases where many components will subscribe to
// the same key (e.g. FlatList renderItem components)
const [withApp, AppProvider] = createOnyxContext(ONYXKEYS.APP);
const [withNetwork, NetworkProvider] = createOnyxContext(ONYXKEYS.NETWORK);
const [withPersonalDetails, PersonalDetailsProvider] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS);
const [withCurrentDate, CurrentDateProvider] = createOnyxContext(ONYXKEYS.CURRENT_DATE);
const [withBlockedFromConcierge, BlockedFromConciergeProvider] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [withReports, ReportsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT);
const [withReportActions, ReportActionsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
const [withSession, SessionProvider] = createOnyxContext(ONYXKEYS.SESSION);
const [withModal, ModalProvider] = createOnyxContext(ONYXKEYS.MODAL);
const [withPolicyCollection, PolicyProvider] = createOnyxContext(ONYXKEYS.COLLECTION.POLICY);
const [withBetas, BetaProvider] = createOnyxContext(ONYXKEYS.BETAS);
const [
    withReportActionsDrafts,
    ReportActionsDraftsProvider,
] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

const OnyxProvider = props => (
    <ComposeProviders
        components={[
            AppProvider,
            NetworkProvider,
            PersonalDetailsProvider,
            ReportActionsDraftsProvider,
            CurrentDateProvider,
            BetaProvider,
            BlockedFromConciergeProvider,
            ReportsProvider,
            ReportActionsProvider,
            SessionProvider,
            ModalProvider,
            PolicyProvider,
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
    withBetas,
    withBlockedFromConcierge,
    withReports,
    withReportActions,
    withSession,
    withModal,
    withPolicyCollection,
    withApp,
};
