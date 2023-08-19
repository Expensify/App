import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useMemo} from 'react';
import {deepEqual} from 'fast-equals';
import {withReportCommentDrafts} from '../OnyxProvider';
import SidebarUtils from '../../libs/SidebarUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import withCurrentReportID, {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps} from '../withCurrentReportID';
import OptionRowLHN, {propTypes as basePropTypes, defaultProps as baseDefaultProps} from './OptionRowLHN';
import * as Report from '../../libs/actions/Report';
import * as UserUtils from '../../libs/UserUtils';
import participantPropTypes from '../participantPropTypes';
import CONST from '../../CONST';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';

const propTypes = {
    /** If true will disable ever setting the OptionRowLHN to focused */
    shouldDisableFocusOptions: PropTypes.bool,

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The preferred language for the app */
    preferredLocale: PropTypes.string,

    /** The full data of the report */
    // eslint-disable-next-line react/forbid-prop-types
    fullReport: PropTypes.object,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The ID of the policy */
            id: PropTypes.string,
            /** Name of the policy */
            name: PropTypes.string,
            /** Avatar of the policy */
            avatar: PropTypes.string,
        }),
    ),

    /** The actions from the parent report */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    ...withCurrentReportIDPropTypes,
    ...basePropTypes,
};

const defaultProps = {
    shouldDisableFocusOptions: false,
    personalDetails: {},
    fullReport: {},
    policies: {},
    parentReportActions: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
    ...withCurrentReportIDDefaultProps,
    ...baseDefaultProps,
};

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData({
    shouldDisableFocusOptions,
    currentReportID,
    fullReport,
    reportActions,
    personalDetails,
    preferredLocale,
    comment,
    policies,
    parentReportActions,
    ...propsToForward
}) {
    const reportID = propsToForward.reportID;
    // We only want to pass a boolean to the memoized component,
    // instead of a changing number (so we prevent unnecessary re-renders).
    const isFocused = !shouldDisableFocusOptions && currentReportID === reportID;

    const policy = lodashGet(policies, [`${ONYXKEYS.COLLECTION.POLICY}${fullReport.policyID}`], '');

    const parentReportAction = parentReportActions[fullReport.parentReportActionID];

    const optionItemRef = useRef();
    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData(fullReport, reportActions, personalDetails, preferredLocale, policy);
        if (deepEqual(item, optionItemRef.current)) {
            return optionItemRef.current;
        }
        optionItemRef.current = item;
        return item;
        // Listen parentReportAction to update title of thread report when parentReportAction changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullReport, reportActions, personalDetails, preferredLocale, policy, parentReportAction]);

    useEffect(() => {
        if (!optionItem || optionItem.hasDraftComment || !comment || comment.length <= 0 || isFocused) {
            return;
        }
        Report.setReportWithDraft(reportID, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isFocused={isFocused}
            optionItem={optionItem}
        />
    );
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
                avatar: UserUtils.getAvatar(personalData.avatar, personalData.accountID),
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
    compose(
        withCurrentReportID,
        withReportCommentDrafts({
            propName: 'comment',
            transformValue: (drafts, props) => {
                const draftKey = `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${props.reportID}`;
                return lodashGet(drafts, draftKey, '');
            },
        }),
        withOnyx({
            fullReport: {
                key: (props) => ONYXKEYS.COLLECTION.REPORT + props.reportID,
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
            policies: {
                key: ONYXKEYS.COLLECTION.POLICY,
            },
        }),
        withOnyx({
            parentReportActions: {
                key: ({fullReport}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fullReport.parentReportID}`,
                canEvict: false,
            },
        }),
    )(OptionRowLHNData),
);
