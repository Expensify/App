import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import participantPropTypes from '@components/participantPropTypes';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps as baseDefaultProps, propTypes as basePropTypes} from './OptionRowLHN';
import OptionRowLHNDataReport from './OptionRowLHNDataReport';

const propTypes = {
    /** Whether row should be focused */
    isFocused: PropTypes.bool,

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The preferred language for the app */
    preferredLocale: PropTypes.string,

    /** The full data of the report */
    // eslint-disable-next-line react/forbid-prop-types
    fullReport: PropTypes.object,

    ...basePropTypes,
};

const defaultProps = {
    isFocused: false,
    personalDetails: {},
    fullReport: {},
    policy: {},
    parentReportActions: {},
    transaction: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
    ...baseDefaultProps,
};

/*
 * This component checks whether a fullReport object is defined for the provided reportID
 */
function OptionRowLHNData({isFocused, fullReport, reportActions, personalDetails, preferredLocale, ...propsToForward}) {
    return !_.isEmpty(fullReport) ? (
        <OptionRowLHNDataReport
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isFocused={isFocused}
            fullReport={fullReport}
            reportActions={reportActions}
            personalDetails={personalDetails}
            preferredLocale={preferredLocale}
        />
    ) : null;
}

OptionRowLHNData.propTypes = propTypes;
OptionRowLHNData.defaultProps = defaultProps;
OptionRowLHNData.displayName = 'OptionRowLHNData';

/**
 * @param {Object} [personalDetails]
 * @returns {Object|undefined}
 */
const personalDetailsSelector = (personalDetails) =>
    _.reduce(
        personalDetails,
        (finalPersonalDetails, personalData, accountID) => {
            // It's OK to do param-reassignment in _.reduce() because we absolutely know the starting state of finalPersonalDetails
            // eslint-disable-next-line no-param-reassign
            finalPersonalDetails[accountID] = {
                accountID: Number(accountID),
                login: personalData.login,
                displayName: personalData.displayName,
                firstName: personalData.firstName,
                status: personalData.status,
                avatar: UserUtils.getAvatar(personalData.avatar, personalData.accountID),
                fallbackIcon: personalData.fallbackIcon,
            };
            return finalPersonalDetails;
        },
        {},
    );

/**
 * This component is rendered in a list.
 * On scroll we want to avoid that a item re-renders
 * just because the list has to re-render when adding more items.
 * Thats also why the React.memo is used on the outer component here, as we just
 * use it to prevent re-renders from parent re-renders.
 */
export default React.memo(
    withOnyx({
        comment: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        },
        fullReport: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        reportActions: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            canEvict: false,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            selector: personalDetailsSelector,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    })(OptionRowLHNData),
);
