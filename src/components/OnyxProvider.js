import React from 'react';
import PropTypes from 'prop-types';
import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';
import ComposeProviders from './ComposeProviders';

const [withNetwork, NetworkProvider] = createOnyxContext(ONYXKEYS.NETWORK);
const [withPersonalDetails, PersonalDetailsProvider] = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS);
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
            NetworkProvider,
            PersonalDetailsProvider,
            ReportActionsDraftsProvider,
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
};
