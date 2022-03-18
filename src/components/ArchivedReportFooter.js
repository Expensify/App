import lodashGet from 'lodash/get';
import _ from 'underscore';
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
        message: PropTypes.shape({
            reason: PropTypes.string.isRequired,
            oldLogin: PropTypes.string,
            newLogin: PropTypes.string,
        }).isRequired,
    }).isRequired,

    /** The archived report */
    report: PropTypes.shape({
        /** Participants associated with the report */
        participants: PropTypes.arrayOf(PropTypes.string),

        /** The policy this report is attached to */
        policyID: PropTypes.string,
    }).isRequired,

    /** Personal details of all users */
    personalDetails: PropTypes.objectOf(personalDetailsPropType).isRequired,

    /** The list of policies the user has access to. */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The ID of the policy */
        ID: PropTypes.string,

        /** The name of the policy */
        name: PropTypes.string,
    })).isRequired,

    ...withLocalizePropTypes,
};

const ArchivedReportFooter = (props) => {
    const archiveReason = lodashGet(props.reportClosedAction, 'message.reason', CONST.REPORT.ARCHIVE_REASON.DEFAULT);
    const policyName = lodashGet(props.policies, `policy_${props.report.policyID}.name`);
    let displayName = _.has(props.personalDetails, props.report.ownerEmail)
        ? props.personalDetails[props.report.ownerEmail].displayName
        : props.report.ownerEmail;

    let oldDisplayName;
    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        const newLogin = props.reportClosedAction.message.newLogin;
        const oldLogin = props.reportClosedAction.message.oldLogin;
        displayName = lodashGet(props.personalDetails, `${newLogin}.displayName`, newLogin);
        oldDisplayName = lodashGet(props.personalDetails, `${oldLogin}.displayName`, oldLogin);
    }

    return (
        <Banner
            text={props.translate(`reportArchiveReasons.${archiveReason}`, {
                displayName,
                oldDisplayName,
                policyName,
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
