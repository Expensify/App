import {FlashList} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import React, {useCallback} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import withCurrentReportID from '@components/withCurrentReportID';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import LHNOptionsContext from './LHNOptionsContext';
import OptionRowLHN from './OptionRowLHN';
import OptionRowLHNData from './OptionRowLHNData';
import type {LHNOptionsListOnyxProps, LHNOptionsListProps, RegisterOption, RenderItemProps} from './types';

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
    transactionViolations = {},
    onFirstItemRendered = () => {},
}: LHNOptionsListProps) {
    const styles = useThemeStyles();
    const {canUseViolations} = usePermissions();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [optionItems, setOptionItems] = React.useState<Record<string, OptionData | undefined>>({});

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

    const registerOption = useCallback<RegisterOption>(
        (optionItem: OptionData | undefined) => {
            optionItems[optionItem?.reportID ?? ''] = optionItem;
            // setOptionItems(items => ({
            //     ...items,
            //     [optionItem.reportID]: optionItem,
            // }));
        },
        [optionItems],
    );

    const sortedReportIDs = SidebarUtils.getOrderedReportIDs(data, optionItems, optionMode);

    const contextValue = React.useMemo(
        () => ({
            registerOption,
        }),
        [registerOption],
    );

    /**
     * Function which prepares a row in the list
     */
    const prepareItem = useCallback(
        ({item: reportID}: RenderItemProps): ReactElement => {
            const itemFullReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? null;
            const itemReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? null;
            const itemParentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport?.parentReportID}`] ?? null;
            const itemParentReportAction = itemParentReportActions?.[itemFullReport?.parentReportActionID ?? ''] ?? null;
            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport?.policyID}`] ?? null;
            const transactionID = itemParentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? itemParentReportAction.originalMessage.IOUTransactionID ?? '' : '';
            const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? null;
            const itemComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] ?? '';
            const participants = [...ReportUtils.getParticipantsIDs(itemFullReport), itemFullReport?.ownerAccountID, itemParentReportAction?.actorAccountID].filter(Boolean) as number[];
            const participantsPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails);

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
                    preferredLocale={preferredLocale}
                    comment={itemComment}
                    transactionViolations={transactionViolations}
                    canUseViolations={canUseViolations}
                />
            );
        },
        [draftComments, personalDetails, policy, preferredLocale, reportActions, reports, transactions, transactionViolations, canUseViolations],
    );

    /**
     * Function which renders a row in the list
     */
    const renderItem = useCallback(
        ({item: reportID}: RenderItemProps): ReactElement => {
            const optionItem = optionItems[reportID];
            return (
                <OptionRowLHN
                    optionItem={optionItem}
                    isFocused={!shouldDisableFocusOptions && reportID === currentReportID}
                    reportID={reportID}
                    viewMode={optionMode}
                    onSelectRow={onSelectRow}
                    onLayout={onLayoutItem}
                />
            );
        },
        [currentReportID, onLayoutItem, onSelectRow, optionItems, optionMode, shouldDisableFocusOptions],
    );

    return (
        <>
            <View style={styles.flex0}>
                <LHNOptionsContext.Provider value={contextValue}>
                    <FlatList
                        data={data}
                        testID="lhn-options-list-virtualized"
                        keyExtractor={keyExtractor}
                        renderItem={prepareItem}
                        initialNumToRender={data.length}
                    />
                </LHNOptionsContext.Provider>
            </View>
            <View style={style ?? styles.flex1}>
                <FlashList
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={StyleSheet.flatten(contentContainerStyles)}
                    data={sortedReportIDs}
                    testID="lhn-options-list"
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    estimatedItemSize={optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight}
                    extraData={[currentReportID]}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </>
    );
}

LHNOptionsList.displayName = 'LHNOptionsList';

export default withCurrentReportID(
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
        transactionViolations: {
            key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        },
    })(LHNOptionsList),
);

export type {LHNOptionsListProps};
