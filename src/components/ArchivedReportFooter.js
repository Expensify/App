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
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';

const propTypes = {
    /** The archived report */
    report: PropTypes.shape({
        /** The email of the owner of the report */
        ownerEmail: PropTypes.string,
    }).isRequired,

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)).isRequired,

    /** Personal details of all users */
    personalDetails: PropTypes.objectOf(personalDetailsPropType).isRequired,

    /** The list of policies the user has access to. */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The name of the policy */
        name: PropTypes.string,
    })).isRequired,

    ...withLocalizePropTypes,
};

const ArchivedReportFooter = (props) => {
    const archivedText = ReportUtils.getArchivedText(props.report, props.reportActions, props.personalDetails, props.policies);
    return (
        <Banner html={archivedText} />
    );
};

ArchivedReportFooter.propTypes = propTypes;
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
