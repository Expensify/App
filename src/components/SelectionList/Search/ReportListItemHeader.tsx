import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ColorValue} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Checkbox from '@components/Checkbox';
import ReportSearchHeader from '@components/ReportSearchHeader';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem, ReportListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {isCorrectSearchUserName} from '@libs/SearchUIUtils';
import {handleActionButtonPress} from '@userActions/Search';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import ActionCell from './ActionCell';
import UserInfoCellsWithArrow from './UserInfoCellsWithArrow';

type ReportListItemHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The section list item */
    item: TItem;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether the item is hovered */
    isHovered?: boolean;

    /** Whether the item is focused */
    isFocused?: boolean;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;
};

type FirstRowReportHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The section list item */
    item: TItem;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Callback passed as goToItem in actionCell, triggered by clicking actionButton */
    handleOnButtonPress?: () => void;

    /** Whether the action button should be displayed */
    shouldShowAction?: boolean;

    /** Color of the secondary avatar border, usually should match the container background */
    avatarBorderColor?: ColorValue;
};

type ReportCellProps = {
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
    reportItem: ReportListItemType;
};

function TotalCell({showTooltip, isLargeScreenWidth, reportItem}: ReportCellProps) {
    const styles = useThemeStyles();

    let total = reportItem?.total ?? 0;

    if (total) {
        total *= reportItem?.type === CONST.REPORT.TYPE.EXPENSE || reportItem?.type === CONST.REPORT.TYPE.INVOICE ? -1 : 1;
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={convertToDisplayString(total, reportItem?.currency)}
            style={[styles.optionDisplayName, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? styles.textNormal : [styles.textBold, styles.textAlignRight]]}
        />
    );
}

function FirstHeaderRow<TItem extends ListItem>({
    policy,
    report: moneyRequestReport,
    item,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    handleOnButtonPress = () => {},
    shouldShowAction = false,
    avatarBorderColor,
}: FirstRowReportHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const reportItem = item as unknown as ReportListItemType;

    return (
        <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart, styles.pr3, styles.pl3]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={() => onCheckboxPress?.(item)}
                        isChecked={item.isSelected}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                        disabled={!!isDisabled || item.isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                    />
                )}
                <View style={{flexShrink: 1, flexGrow: 1, minWidth: 0}}>
                    <ReportSearchHeader
                        report={moneyRequestReport}
                        policy={policy}
                        style={[{maxWidth: 700}]}
                        transactions={reportItem.transactions}
                        avatarBorderColor={avatarBorderColor}
                    />
                </View>
            </View>
            <View style={[styles.flexShrink0, shouldShowAction && styles.mr3]}>
                <TotalCell
                    showTooltip
                    isLargeScreenWidth={false}
                    reportItem={reportItem}
                />
            </View>
            {shouldShowAction && (
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                    <ActionCell
                        action={reportItem.action}
                        goToItem={handleOnButtonPress}
                        isSelected={item.isSelected}
                        isLoading={reportItem.isActionLoading}
                    />
                </View>
            )}
        </View>
    );
}

function ReportListItemHeader<TItem extends ListItem>({
    policy,
    report: moneyRequestReport,
    item,
    onSelectRow,
    onCheckboxPress,
    isDisabled,
    isHovered,
    isFocused,
    canSelectMultiple,
}: ReportListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const reportItem = item as unknown as ReportListItemType;
    const {currentSearchHash} = useSearchContext();
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const thereIsFromAndTo = !!reportItem?.from && !!reportItem?.to;
    const showArrowComponent = (reportItem.type === CONST.REPORT.TYPE.IOU && thereIsFromAndTo) || (reportItem.type === CONST.REPORT.TYPE.EXPENSE && !!reportItem?.from);
    const participantToDisplayName = useMemo(
        () => reportItem?.to?.displayName ?? reportItem?.to?.login ?? translate('common.hidden'),
        [reportItem?.to?.displayName, reportItem?.to?.login, translate],
    );
    const shouldShowToRecipient = useMemo(
        () => thereIsFromAndTo && !!reportItem?.to?.accountID && reportItem?.from?.accountID !== reportItem?.to?.accountID && !!isCorrectSearchUserName(participantToDisplayName),
        [thereIsFromAndTo, reportItem?.from?.accountID, reportItem?.to?.accountID, participantToDisplayName],
    );
    const avatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused || !!isHovered, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

    const handleOnButtonPress = () => {
        handleActionButtonPress(currentSearchHash, reportItem, () => onSelectRow(item));
    };
    return !isLargeScreenWidth ? (
        <View>
            <FirstHeaderRow
                item={item}
                report={moneyRequestReport}
                policy={policy}
                onCheckboxPress={onCheckboxPress}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                avatarBorderColor={avatarBorderColor}
            />
            <View
                style={[
                    styles.pt0,
                    styles.flexRow,
                    styles.alignItemsCenter,
                    showArrowComponent ? styles.justifyContentBetween : styles.justifyContentEnd,
                    styles.pr3,
                    styles.pl3,
                    styles.gap2,
                ]}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                    {showArrowComponent && (
                        <UserInfoCellsWithArrow
                            shouldShowToRecipient={shouldShowToRecipient}
                            participantFrom={reportItem?.from}
                            participantFromDisplayName={reportItem?.from?.displayName ?? reportItem?.from?.login ?? translate('common.hidden')}
                            participantToDisplayName={participantToDisplayName}
                            participantTo={reportItem?.to}
                            avatarSize="mid-subscript"
                            infoCellsTextStyle={{...styles.textMicroBold, lineHeight: 14}}
                            infoCellsAvatarStyle={styles.pr1}
                            fromRecipientStyle={!shouldShowToRecipient ? styles.mw100 : {}}
                        />
                    )}
                </View>
                <View>
                    <ActionCell
                        action={reportItem.action}
                        goToItem={handleOnButtonPress}
                        isSelected={item.isSelected}
                        isLoading={reportItem.isActionLoading}
                    />
                </View>
            </View>
        </View>
    ) : (
        <View>
            <FirstHeaderRow
                item={item}
                report={moneyRequestReport}
                policy={policy}
                onCheckboxPress={onCheckboxPress}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                shouldShowAction
                handleOnButtonPress={handleOnButtonPress}
                avatarBorderColor={avatarBorderColor}
            />
            <View style={[styles.mr3, styles.ml3, styles.pv2]}>
                <View style={[styles.borderBottom]} />
            </View>
        </View>
    );
}

ReportListItemHeader.displayName = 'ReportListItemHeader';

export default ReportListItemHeader;
