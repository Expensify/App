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
const [withReportActionsDrafts, ReportActionsDraftsProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS);
const [withPolicyCollection, PolicyCollectionProvider] = createOnyxContext(ONYXKEYS.COLLECTION.POLICY);
const [withBlockedFromConcierge, BlockedFromConciergeProvider] = createOnyxContext(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
const [withModal, ModalProvider] = createOnyxContext(ONYXKEYS.MODAL);
const [withBetas, BetaProvider] = createOnyxContext(ONYXKEYS.BETAS);
const [withReportCollection, ReportCollectionProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT);
const [withReportActionsCollection, ReportActionsCollectionProvider] = createOnyxContext(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

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
            BlockedFromConciergeProvider,
            ModalProvider,
            PolicyCollectionProvider,
            BetaProvider,
            ReportCollectionProvider,
            ReportActionsCollectionProvider,
        ]}
    >
        {props.children}
    </ComposeProviders>
);

OnyxProvider.displayName = 'OnyxProvider';
OnyxProvider.propTypes = propTypes;

export default OnyxProvider;

export {
    withModal,
    withNetwork,
    withPersonalDetails,
    withReportActionsDrafts,
    withCurrentDate,
    withBlockedFromConcierge,
    withPolicyCollection,
    withBetas,
    withReportCollection,
    withReportActionsCollection,
};
