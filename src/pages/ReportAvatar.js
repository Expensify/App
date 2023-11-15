import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AttachmentModal from '@components/AttachmentModal';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import reportPropTypes from './reportPropTypes';

/**
 * @param {Object} route
 * @returns {String}
 */
function getReportIDFromRoute(route) {
    return lodashGet(route, 'params.reportID', '0');
}

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The reportID of the user */
            reportID: PropTypes.string.isRequired,
        }),
    }).isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** The policy of the report */
    policy: PropTypes.shape({
        /** The ID of the policy */
        id: PropTypes.string,

        /** The name of the policy */
        name: PropTypes.string,

        /** The URL for the policy avatar */
        avatar: PropTypes.string,

        /** File name of the avatar */
        originalFileName: PropTypes.string,
    }),

    /** Indicates whether the app is loading initial data */
    isLoadingReportData: PropTypes.bool,
};

const defaultProps = {
    report: {},
    policy: {},
    isLoadingReportData: true,
};

function ReportAvatar(props) {
    const isArchivedRoom = ReportUtils.isArchivedRoom(props.report);
    const policyName = isArchivedRoom ? props.report.oldPolicyName : lodashGet(props.policy, 'name', '');
    const avatarURL = lodashGet(props.policy, 'avatar', '') || ReportUtils.getDefaultWorkspaceAvatar(policyName);
    return (
        <AttachmentModal
            headerTitle={policyName}
            defaultOpen
            source={UserUtils.getFullSizeAvatar(avatarURL, '')}
            onModalClose={() => {
                Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.report.reportID));
            }}
            isWorkspaceAvatar
            originalFileName={policyName}
            shouldShowNotFoundPage={_.isEmpty(props.report.reportID) && !props.isLoadingReportData}
            isLoading={_.isEmpty(props.report) && props.isLoadingReportData}
        />
    );
}

ReportAvatar.propTypes = propTypes;
ReportAvatar.defaultProps = defaultProps;
ReportAvatar.displayName = 'ReportAvatar';

export default compose(
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${getReportIDFromRoute(route)}`,
        },
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
    }),
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
    }),
)(ReportAvatar);
