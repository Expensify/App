import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import Banner from './Banner';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import personalDetailsPropType from '../pages/personalDetailsPropType';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportUtils from '../libs/ReportUtils';
import reportPropTypes from '../pages/reportPropTypes';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import styles from '../styles/styles';
import * as PersonalDetailsUtils from '../libs/PersonalDetailsUtils';

const propTypes = {
    /** The reason this report was archived */
    reportClosedAction: PropTypes.shape({
        /** Message attached to the report closed action */
        originalMessage: PropTypes.shape({
            /** The reason the report was closed */
            reason: PropTypes.string.isRequired,

            /** (For accountMerged reason only), the accountID of the previous owner of this report. */
            oldAccountID: PropTypes.number,

            /** (For accountMerged reason only), the accountID of the account the previous owner was merged into */
            newAccountID: PropTypes.number,
        }).isRequired,
    }),

    /** The archived report */
    report: reportPropTypes.isRequired,

    /** Personal details of all users */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    ...withLocalizePropTypes,
};

const defaultProps = {
    reportClosedAction: {
        originalMessage: {
            reason: CONST.REPORT.ARCHIVE_REASON.DEFAULT,
        },
    },
    personalDetails: {},
};

function ArchivedReportFooter(props) {
    const archiveReason = lodashGet(props.reportClosedAction, 'originalMessage.reason', CONST.REPORT.ARCHIVE_REASON.DEFAULT);
    let displayName = PersonalDetailsUtils.getDisplayNameOrDefault(props.personalDetails, [props.report.ownerAccountID, 'displayName'], props.report.ownerEmail);

    let oldDisplayName;
    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        const newAccountID = props.reportClosedAction.originalMessage.newAccountID;
        const oldAccountID = props.reportClosedAction.originalMessage.oldAccountID;
        displayName = PersonalDetailsUtils.getDisplayNameOrDefault(props.personalDetails, [newAccountID, 'displayName']);
        oldDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(props.personalDetails, [oldAccountID, 'displayName']);
    }

    return (
        <Banner
            containerStyles={[styles.archivedReportFooter]}
            text={props.translate(`reportArchiveReasons.${archiveReason}`, {
                displayName: `<strong>${displayName}</strong>`,
                oldDisplayName: `<strong>${oldDisplayName}</strong>`,
                policyName: `<strong>${ReportUtils.getPolicyName(props.report)}</strong>`,
            })}
            shouldRenderHTML={archiveReason !== CONST.REPORT.ARCHIVE_REASON.DEFAULT}
            shouldShowIcon
        />
    );
}

ArchivedReportFooter.propTypes = propTypes;
ArchivedReportFooter.defaultProps = defaultProps;
ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        reportClosedAction: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            canEvict: false,
            selector: ReportActionsUtils.getLastClosedReportAction,
        },
    }),
)(ArchivedReportFooter);
