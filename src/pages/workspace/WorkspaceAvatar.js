import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AttachmentModal from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * @param {Object} route
 * @returns {String}
 */
function getPolicyIDFromRoute(route) {
    return lodashGet(route, 'params.policyID', '');
}

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The policyID of the user */
            policyID: PropTypes.string.isRequired,
        }),
    }).isRequired,

    /** The policy object for the current route */
    policy: PropTypes.shape({
        /** The ID of the policy */
        id: PropTypes.string,

        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,

        /** File name of the avatar */
        originalFileName: PropTypes.string,
    }).isRequired,

    /** Indicates whether the app is loading initial data */
    isLoadingReportData: PropTypes.bool,
};

const defaultProps = {
    isLoadingReportData: true,
};

function WorkspaceAvatar(props) {
    return (
        <AttachmentModal
            headerTitle={lodashGet(props.policy, 'name', '')}
            defaultOpen
            source={lodashGet(props.policy, 'avatar', '') || ReportUtils.getDefaultWorkspaceAvatar(lodashGet(props.policy, 'name', ''))}
            onModalClose={() => {
                Navigation.goBack(ROUTES.WORKSPACE_SETTINGS.getRoute(getPolicyIDFromRoute(props.route)));
            }}
            isWorkspaceAvatar
            originalFileName={lodashGet(props.policy, 'name', '')}
            shouldShowNotFoundPage={_.isEmpty(props.policy) && !props.isLoadingReportData}
            isLoading={_.isEmpty(props.policy) && props.isLoadingReportData}
        />
    );
}

WorkspaceAvatar.propTypes = propTypes;
WorkspaceAvatar.defaultProps = defaultProps;
WorkspaceAvatar.displayName = 'WorkspaceAvatar';

export default withOnyx({
    policy: {
        key: (props) => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromRoute(props.route)}`,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(WorkspaceAvatar);
