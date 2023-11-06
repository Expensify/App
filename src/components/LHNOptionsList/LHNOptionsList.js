import PropTypes from 'prop-types';
import {FlatList, View} from 'react-native';
import React, {useCallback, useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '@styles/styles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import OptionRowLHNDataWithFocus from '@components/LHNOptionsList/OptionRowLHNDataWithFocus';
import participantPropTypes from '@components/participantPropTypes';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as UserUtils from '@libs/UserUtils';

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
    transactions: PropTypes.objectOf(
        PropTypes.shape({
            /** The ID of the transaction */
            transactionID: PropTypes.string,
        }),
    ),
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
}) {
    const itemPersonalDetails = useMemo(
        () =>
            _.reduce(
                personalDetails,
                (finalPersonalDetails, personalData, accountID) => {
                    // It's OK to do param-reassignment in _.reduce() because we absolutely know the starting state of finalPersonalDetails
                    // eslint-disable-next-line no-param-reassign
                    finalPersonalDetails[accountID] = {
                        ...personalData,
                        accountID: Number(accountID),
                        avatar: UserUtils.getAvatar(personalData.avatar, personalData.accountID),
                    };
                    return finalPersonalDetails;
                },
                {},
            ),
        [personalDetails],
    );
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
        ({item}) => {
            const itemFullReport = reports[`${ONYXKEYS.COLLECTION.REPORT}${item}`];
            const itemReportActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${item}`];
            const itemParentReportActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport.parentReportID}`];
            const itemPolicy = policy[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport.policyID}`];
            const itemTransaction = `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(
                itemParentReportActions,
                [itemFullReport.parentReportActionID, 'originalMessage', 'IOUTransactionID'],
                '',
            )}`;
            const participantPersonalDetailList = _.values(OptionsListUtils.getPersonalDetailsForAccountIDs(itemFullReport.participantAccountIDs, itemPersonalDetails));
            return (
                <OptionRowLHNDataWithFocus
                    reportID={item}
                    fullReport={itemFullReport}
                    reportActions={itemReportActions}
                    parentReportActions={itemParentReportActions}
                    policy={itemPolicy}
                    personalDetails={participantPersonalDetailList}
                    transaction={itemTransaction}
                    receiptTransactions={transactions}
                    viewMode={optionMode}
                    shouldDisableFocusOptions={shouldDisableFocusOptions}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                />
            );
        },
        [itemPersonalDetails, onSelectRow, optionMode, policy, preferredLocale, reportActions, reports, shouldDisableFocusOptions, transactions],
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
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
            />
        </View>
    );
}

LHNOptionsList.propTypes = propTypes;
LHNOptionsList.defaultProps = defaultProps;
LHNOptionsList.displayName = 'LHNOptionsList';

export default withOnyx({
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
})(LHNOptionsList);
