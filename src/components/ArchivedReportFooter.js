import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import Banner from './Banner';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/reportUtils';
import personalDetailsPropType from '../pages/personalDetailsPropType';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The reason this report was archived. */
    archiveReason: PropTypes.string,

    /** The archived report */
    report: PropTypes.shape({
        /** Participants associated with the report */
        participants: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,

    personalDetails: PropTypes.objectOf(personalDetailsPropType).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    archiveReason: CONST.REPORT.ARCHIVE_REASON.DEFAULT,
};

const ArchivedReportFooter = (props) => {
    // TODO: move https://github.com/Expensify/Web-Expensify/pull/33104/files logic to front-end so we can get the policy name here.

    // TODO: account for manually archived policy rooms
    const archiveReason = ReportUtils.isPolicyExpenseChat(props.report)
        ? props.archiveReason
        : CONST.REPORT.ARCHIVE_REASON.DEFAULT;
    // TODO: verify this isn't a problem when used on archived rooms – owner of chat reports is __FAKE__
    const displayName = _.has(props.personalDetails, props.report.ownerEmail)
        ? props.personalDetails[props.report.ownerEmail].displayName
        : props.report.ownerEmail;
    return (
        <Banner
            text={props.translate(`reportArchiveReasons.${archiveReason}`, {
                displayName,
                oldDisplayName: props.oldDisplayName,
                policyName: props.policyName,
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
    }),
)(ArchivedReportFooter);
