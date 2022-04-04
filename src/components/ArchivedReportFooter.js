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

const propTypes = {
    /** The reason this report was archived */
    reportClosedAction: PropTypes.shape({
        /** Message attached to the report closed action */
        originalMessage: PropTypes.shape({
            /** The reason the report was closed */
            reason: PropTypes.string.isRequired,

            /** (For accountMerged reason only), the email of the previous owner of this report. */
            oldLogin: PropTypes.string,

            /** (For accountMerged reason only), the email of the account the previous owner was merged into */
            newLogin: PropTypes.string,
        }).isRequired,
    }),

    /** The archived report */
    report: PropTypes.shape({
        /** The policy this report is attached to */
        policyID: PropTypes.string,
    }).isRequired,

    /** Personal details of all users */
    personalDetails: PropTypes.objectOf(personalDetailsPropType).isRequired,

    /** The list of policies the user has access to. */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,
    })).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reportClosedAction: {
        originalMessage: {
            reason: CONST.REPORT.ARCHIVE_REASON.DEFAULT,
        },
    },
};

const ArchivedReportFooter = (props) => {
    const archiveReason = lodashGet(props.reportClosedAction, 'originalMessage.reason', CONST.REPORT.ARCHIVE_REASON.DEFAULT);
    const policyName = lodashGet(props.policies, `${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}.name`, props.report.oldPolicyName);
    let displayName = lodashGet(props.personalDetails, `${props.report.ownerEmail}.displayName`, props.report.ownerEmail);

    let oldDisplayName;
    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        const newLogin = props.reportClosedAction.originalMessage.newLogin;
        const oldLogin = props.reportClosedAction.originalMessage.oldLogin;
        displayName = lodashGet(props.personalDetails, `${newLogin}.displayName`, newLogin);
        oldDisplayName = lodashGet(props.personalDetails, `${oldLogin}.displayName`, oldLogin);
    }

    return (
        <Banner
            text={props.translate(`reportArchiveReasons.${archiveReason}`, {
                displayName: `<strong>${displayName}</strong>`,
                oldDisplayName: `<strong>${oldDisplayName}</strong>`,
                policyName: `<strong>${policyName}</strong>`,
            })}
            shouldRenderHTML={archiveReason !== CONST.REPORT.ARCHIVE_REASON.DEFAULT}
        />
    );
};

ArchivedReportFooter.propTypes = propTypes;
ArchivedReportFooter.defaultProps = defaultProps;
ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ArchivedReportFooter);
