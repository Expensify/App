import {FlashList} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHNData from './OptionRowLHNData';
import type {LHNOptionsListOnyxProps, LHNOptionsListProps, RenderItemProps} from './types';

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
    draftComments = {},
    transactionViolations = {},
    onFirstItemRendered = () => {},
}: LHNOptionsListProps) {
    const styles = useThemeStyles();
    const {canUseViolations} = usePermissions();

    // When the first item renders we want to call the onFirstItemRendered callback.
    // At this point in time we know that the list is actually displaying items.
    const hasCalledOnLayout = React.useRef(false);
    const onLayoutItem = useCallback(() => {
        if (hasCalledOnLayout.current) {
            return;
        }
        hasCalledOnLayout.current = true;

        onFirstItemRendered();
    }, [onFirstItemRendered]);

    /**
     * Function which renders a row in the list
     */
    const renderItem = useCallback(
        ({item: reportID}: RenderItemProps): ReactElement => {
            const itemFullReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? null;
            const itemReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? null;
            const itemParentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport?.parentReportID}`] ?? null;
            const itemParentReportAction = itemParentReportActions?.[itemFullReport?.parentReportActionID ?? ''] ?? null;
            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport?.policyID}`] ?? null;
            const transactionID = itemParentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? itemParentReportAction.originalMessage.IOUTransactionID ?? '' : '';
            const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? null;
            const itemComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] ?? '';
            const sortedReportActions = ReportActionsUtils.getSortedReportActionsForDisplay(itemReportActions);
            const lastReportAction = sortedReportActions[0];

            // Get the transaction for the last report action
            let lastReportActionTransactionID = '';

            if (lastReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                lastReportActionTransactionID = lastReportAction.originalMessage?.IOUTransactionID ?? '';
            }
            const lastReportActionTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${lastReportActionTransactionID}`] ?? {};

            return (
                <OptionRowLHNData
                    reportID={reportID}
                    fullReport={itemFullReport}
                    reportActions={itemReportActions}
                    parentReportAction={itemParentReportAction}
                    policy={itemPolicy}
                    personalDetails={personalDetails ?? {}}
                    transaction={itemTransaction}
                    lastReportActionTransaction={lastReportActionTransaction}
                    receiptTransactions={transactions}
                    viewMode={optionMode}
                    isFocused={!shouldDisableFocusOptions}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                    comment={itemComment}
                    transactionViolations={transactionViolations}
                    canUseViolations={canUseViolations}
                    onLayout={onLayoutItem}
                />
            );
        },
        [
            draftComments,
            onSelectRow,
            optionMode,
            personalDetails,
            policy,
            preferredLocale,
            reportActions,
            reports,
            shouldDisableFocusOptions,
            transactions,
            transactionViolations,
            canUseViolations,
            onLayoutItem,
        ],
    );

    const extraData = useMemo(() => [reportActions, reports, policy, personalDetails], [reportActions, reports, policy, personalDetails]);

    return (
        <View style={style ?? styles.flex1}>
            <FlashList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={StyleSheet.flatten(contentContainerStyles)}
                data={data}
                testID="lhn-options-list"
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                estimatedItemSize={optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight}
                extraData={extraData}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

LHNOptionsList.displayName = 'LHNOptionsList';

export default withOnyx<LHNOptionsListProps, LHNOptionsListOnyxProps>({
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
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    },
})(memo(LHNOptionsList));

export type {LHNOptionsListProps};
