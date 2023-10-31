import _ from 'lodash';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import compose from '@libs/compose';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Banner from './Banner';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

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
    const styles = useThemeStyles();
    const archiveReason = lodashGet(props.reportClosedAction, 'originalMessage.reason', CONST.REPORT.ARCHIVE_REASON.DEFAULT);
    let displayName = PersonalDetailsUtils.getDisplayNameOrDefault(props.personalDetails, [props.report.ownerAccountID, 'displayName']);

    let oldDisplayName;
    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        const newAccountID = props.reportClosedAction.originalMessage.newAccountID;
        const oldAccountID = props.reportClosedAction.originalMessage.oldAccountID;
        displayName = PersonalDetailsUtils.getDisplayNameOrDefault(props.personalDetails, [newAccountID, 'displayName']);
        oldDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(props.personalDetails, [oldAccountID, 'displayName']);
    }

    const shouldRenderHTML = archiveReason !== CONST.REPORT.ARCHIVE_REASON.DEFAULT;

    let policyName = ReportUtils.getPolicyName(props.report);

    if (shouldRenderHTML) {
        oldDisplayName = _.escape(oldDisplayName);
        displayName = _.escape(displayName);
        policyName = _.escape(policyName);
    }

    return (
        <Banner
            containerStyles={[styles.archivedReportFooter]}
            text={props.translate(`reportArchiveReasons.${archiveReason}`, {
                displayName: `<strong>${displayName}</strong>`,
                oldDisplayName: `<strong>${oldDisplayName}</strong>`,
                policyName: `<strong>${policyName}</strong>`,
            })}
            shouldRenderHTML={shouldRenderHTML}
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
