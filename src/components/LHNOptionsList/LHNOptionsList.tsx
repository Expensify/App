import React, {useCallback} from 'react';
import {FlatList, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import withCurrentReportID from '@components/withCurrentReportID';
import compose from '@libs/compose';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHNData from './OptionRowLHNData';
import {LHNOptionsListOnyxProps, LHNOptionsListProps} from './types';

const keyExtractor = (item: string) => `report_${item}`;

function LHNOptionsList({
    style,
    contentContainerStyles,
    data,
    onSelectRow,
    optionMode,
    shouldDisableFocusOptions = false,
    reports = {},
    reportActions = {},
    policy = {},
    preferredLocale = CONST.LOCALES.DEFAULT,
    personalDetails = {},
    transactions = {},
    currentReportID = '',
    draftComments = {},
}: LHNOptionsListProps) {
    const styles = useThemeStyles();

    /**
     * This function is used to compute the layout of any given item in our list. Since we know that each item will have the exact same height, this is a performance optimization
     * so that the heights can be determined before the options are rendered. Otherwise, the heights are determined when each option is rendering and it causes a lot of overhead on large
     * lists.
     *
     * @param itemData - This is the same as the data we pass into the component
     * @param index the current item's index in the set of data
     */
    const getItemLayout = useCallback(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        (_, index: number) => {
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
     */
    const renderItem = useCallback(
        ({item: reportID}: {item: string}) => {
            const itemFullReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? null;
            const itemReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? null;
            const itemParentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport?.parentReportID}`] ?? null;
            const itemParentReportAction = itemParentReportActions?.[itemFullReport?.parentReportActionID ?? ''] ?? null;
            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport?.policyID}`] ?? null;
            const transactionID = itemParentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? itemParentReportAction.originalMessage.IOUTransactionID ?? '' : '';
            const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? null;
            const itemComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] ?? '';
            const participantsPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(itemFullReport?.participantAccountIDs ?? [], personalDetails);
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
        <View style={style ?? styles.flex1}>
            <FlatList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={contentContainerStyles}
                showsVerticalScrollIndicator={false}
                data={data}
                testID="lhn-options-list"
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialNumToRender={20}
                maxToRenderPerBatch={5}
                windowSize={5}
            />
        </View>
    );
}

LHNOptionsList.displayName = 'LHNOptionsList';

export default compose(
    withOnyx<LHNOptionsListProps, LHNOptionsListOnyxProps>({
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
    withCurrentReportID,
)(LHNOptionsList);

export type {LHNOptionsListProps};
