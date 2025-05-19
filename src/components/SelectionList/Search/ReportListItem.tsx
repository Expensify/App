import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ReportListItemProps, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSearchResultsWithTransactionThreadReportID} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ReportListItemHeader from './ReportListItemHeader';
import TransactionListItemRow from './TransactionListItemRow';

function ReportListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onCheckboxPress,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    queryJSONHash,
}: ReportListItemProps<TItem>) {
    const reportItem = item as unknown as ReportListItemType;
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canUseTableReportView} = usePermissions();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {allowStaleData: true, initialValue: {}, canBeMissing: true});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem?.policyID}`];
    const isEmptyReport = reportItem.transactions.length === 0;
    const isDisabledOrEmpty = isEmptyReport || isDisabled;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv1half,
        styles.ph0,
        styles.overflowHidden,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];

    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();

        const isFromSelfDM = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

        let reportID =
            (!transactionItem.isFromOneTransactionReport || isFromSelfDM) && transactionItem.transactionThreadReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
                ? transactionItem.transactionThreadReportID
                : transactionItem.reportID;

        // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
        if (reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            reportID = generateReportID();
            updateSearchResultsWithTransactionThreadReportID(queryJSONHash, transactionItem.transactionID, reportID);
            Navigation.navigate(
                ROUTES.SEARCH_REPORT.getRoute({
                    reportID,
                    backTo,
                    moneyRequestReportActionID: transactionItem.moneyRequestReportActionID,
                    transactionID: transactionItem.transactionID,
                }),
            );
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
    };

    if (!reportItem?.reportName && reportItem.transactions.length > 1) {
        return null;
    }

    if (isEmptyReport && !canUseTableReportView) {
        return null;
    }

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={[styles.mb2]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onLongPressRow={onLongPressRow}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldShowBlueBorderOnFocus
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
        >
            <View style={[styles.flex1]}>
                <ReportListItemHeader
                    report={reportItem}
                    policy={policy}
                    item={item}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    canSelectMultiple={canSelectMultiple}
                />
                {isEmptyReport ? (
                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mnh13]}>
                        <Text
                            style={[styles.textLabelSupporting]}
                            numberOfLines={1}
                        >
                            {translate('search.moneyRequestReport.emptyStateTitle')}
                        </Text>
                    </View>
                ) : (
                    reportItem.transactions.map((transaction) => (
                        <TransactionListItemRow
                            key={transaction.transactionID}
                            parentAction={reportItem.action}
                            item={transaction}
                            showTooltip={showTooltip}
                            onButtonPress={() => {
                                openReportInRHP(transaction);
                            }}
                            onCheckboxPress={() => onCheckboxPress?.(transaction as unknown as TItem)}
                            showItemHeaderOnNarrowLayout={false}
                            containerStyle={[transaction.isSelected && styles.activeComponentBG, styles.ph3, styles.pv1half]}
                            isChildListItem
                            isDisabled={!!isDisabled}
                            canSelectMultiple={!!canSelectMultiple}
                            isButtonSelected={transaction.isSelected}
                            shouldShowTransactionCheckbox
                        />
                    ))
                )}
            </View>
        </BaseListItem>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
