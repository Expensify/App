import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {FlatList, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import participantPropTypes from '@components/participantPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import withCurrentReportID, {withCurrentReportIDDefaultProps, withCurrentReportIDPropTypes} from '@components/withCurrentReportID';
import compose from '@libs/compose';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import styles from '@styles/styles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHNData from './OptionRowLHNData';

const propTypes = {
    /** Wrapper style for the section list */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    /** Extra styles for the section list container */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Sections for the section list */
    data: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func.isRequired,

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)).isRequired,

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions: PropTypes.bool,

    /** The policy which the user has access to and which the report could be tied to */
    policy: PropTypes.shape({
        /** The ID of the policy */
        id: PropTypes.string,
        /** Name of the policy */
        name: PropTypes.string,
        /** Avatar of the policy */
        avatar: PropTypes.string,
    }),

    /** All reports shared with the user */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The transaction from the parent report action */
    transactions: PropTypes.objectOf(transactionPropTypes),
    /** List of draft comments */
    draftComments: PropTypes.objectOf(PropTypes.string),
    ...withCurrentReportIDPropTypes,
};

const defaultProps = {
    style: styles.flex1,
    shouldDisableFocusOptions: false,
    reportActions: {},
    reports: {},
    policy: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
    personalDetails: {},
    transactions: {},
    draftComments: {},
    ...withCurrentReportIDDefaultProps,
};

const keyExtractor = (item) => item;

function LHNOptionsList({
    style,
    contentContainerStyles,
    data,
    onSelectRow,
    optionMode,
    shouldDisableFocusOptions,
    reports,
    reportActions,
    policy,
    preferredLocale,
    personalDetails,
    transactions,
    draftComments,
    currentReportID,
}) {
    /**
     * This function is used to compute the layout of any given item in our list. Since we know that each item will have the exact same height, this is a performance optimization
     * so that the heights can be determined before the options are rendered. Otherwise, the heights are determined when each option is rendering and it causes a lot of overhead on large
     * lists.
     *
     * @param {Array} itemData - This is the same as the data we pass into the component
     * @param {Number} index the current item's index in the set of data
     *
     * @returns {Object}
     */
    const getItemLayout = useCallback(
        (itemData, index) => {
            const optionHeight = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
            return {
                length: optionHeight,
                offset: index * optionHeight,
                index,
            };
        },
        [optionMode],
    );

    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     *
     * @return {Component}
     */
    const renderItem = useCallback(
        ({item: reportID}) => {
            const itemFullReport = reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] || {};
            const itemReportActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            const itemParentReportActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport.parentReportID}`] || {};
            const itemParentReportAction = itemParentReportActions[itemFullReport.parentReportActionID] || {};
            const itemPolicy = policy[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport.policyID}`] || {};
            const transactionID = lodashGet(itemParentReportAction, ['originalMessage', 'IOUTransactionID'], '');
            const itemTransaction = transactionID ? transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] : {};
            const itemComment = draftComments[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] || '';
            const participantsPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(itemFullReport.participantAccountIDs, personalDetails);

            return (
                <OptionRowLHNData
                    reportID={reportID}
                    fullReport={itemFullReport}
                    reportActions={itemReportActions}
                    parentReportAction={itemParentReportAction}
                    policy={itemPolicy}
                    personalDetails={participantsPersonalDetails}
                    transaction={itemTransaction}
                    receiptTransactions={transactions}
                    viewMode={optionMode}
                    isFocused={!shouldDisableFocusOptions && reportID === currentReportID}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                    comment={itemComment}
                />
            );
        },
        [currentReportID, draftComments, onSelectRow, optionMode, personalDetails, policy, preferredLocale, reportActions, reports, shouldDisableFocusOptions, transactions],
    );

    return (
        <View style={style}>
            <FlatList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={contentContainerStyles}
                showsVerticalScrollIndicator={false}
                data={data}
                testID="lhn-options-list"
                keyExtractor={keyExtractor}
                stickySectionHeadersEnabled={false}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialNumToRender={20}
                maxToRenderPerBatch={5}
                windowSize={5}
            />
        </View>
    );
}

LHNOptionsList.propTypes = propTypes;
LHNOptionsList.defaultProps = defaultProps;
LHNOptionsList.displayName = 'LHNOptionsList';

export default compose(
    withCurrentReportID,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        reportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        },
        policy: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        transactions: {
            key: ONYXKEYS.COLLECTION.TRANSACTION,
        },
        draftComments: {
            key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        },
    }),
)(LHNOptionsList);
