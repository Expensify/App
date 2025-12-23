import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import ReportActionAvatars from '@components/ReportActionAvatars';
import type {SearchColumnType} from '@components/Search/types';
import type {ListItem, TransactionCardGroupListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';
import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import ExpensesCell from './ExpensesCell';
import TotalCell from './TotalCell';

type CardListItemHeaderProps<TItem extends ListItem> = {
    /** The card currently being looked at */
    card: TransactionCardGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether the item is focused */
    isFocused?: boolean;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    /** Callback for when the down arrow is clicked */
    onDownArrowClick?: () => void;

    /** Whether the down arrow is expanded */
    isExpanded?: boolean;

    /** The visible columns for the header */
    columns?: SearchColumnType[];
};

function CardListItemHeader<TItem extends ListItem>({
    card: cardItem,
    onCheckboxPress,
    isDisabled,
    isFocused,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    onDownArrowClick,
    columns,
    isExpanded,
}: CardListItemHeaderProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const formattedDisplayName = formatPhoneNumber(getDisplayNameOrDefault(cardItem));
    const backgroundColor =
        StyleUtils.getItemBackgroundColorStyle(!!cardItem.isSelected, !!isFocused, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ?? theme.highlightBG;

    const columnComponents = {
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CARD)}
            >
                <View style={[styles.gapHalf, styles.flexShrink1]}>
                    <TextWithTooltip text={cardItem.formattedCardName ?? ''} />
                </View>
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_FEED]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_FEED}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FEED)}
            >
                <TextWithTooltip
                    text={cardItem.formattedFeedName ?? ''}
                    style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre]}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)}
            >
                <ExpensesCell count={cardItem.count} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, false, false, false, false, false, false, false, true)}
            >
                <TotalCell
                    total={cardItem.total}
                    currency={cardItem.currency}
                />
            </View>
        ),
    };

    return (
        <View>
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth ? styles.gap3 : styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(cardItem as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            disabled={!!isDisabled || cardItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            style={isLargeScreenWidth && styles.mr1}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <ReportActionAvatars
                                subscriptCardFeed={cardItem.bank as CompanyCardFeed}
                                subscriptAvatarBorderColor={backgroundColor}
                                noRightMarginOnSubscriptContainer
                                accountIDs={[cardItem.accountID]}
                            />
                            <View style={[styles.gapHalf, styles.flexShrink1]}>
                                <TextWithTooltip
                                    text={formattedDisplayName}
                                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                                />
                                <TextWithTooltip
                                    text={`${cardItem.cardName}${cardItem.lastFourPAN ? ` ${CONST.DOT_SEPARATOR} ` : ''}${cardItem.lastFourPAN}`}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                />
                            </View>
                        </View>
                    )}
                    {isLargeScreenWidth && (
                        <>
                            <View style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)}>
                                <UserDetailsTooltip accountID={cardItem.accountID}>
                                    <View>
                                        <ReportActionAvatars
                                            subscriptCardFeed={cardItem.bank as CompanyCardFeed}
                                            subscriptAvatarBorderColor={backgroundColor}
                                            noRightMarginOnSubscriptContainer
                                            accountIDs={[cardItem.accountID]}
                                        />
                                    </View>
                                </UserDetailsTooltip>
                            </View>

                            {columns?.map((column) => columnComponents[column as keyof typeof columnComponents])}
                        </>
                    )}
                </View>
                {!isLargeScreenWidth && (
                    <View style={[[styles.flexShrink0, styles.mr3, styles.gap1]]}>
                        <TotalCell
                            total={cardItem.total}
                            currency={cardItem.currency}
                        />
                        {!!onDownArrowClick && (
                            <ExpandCollapseArrowButton
                                isExpanded={isExpanded}
                                onPress={onDownArrowClick}
                            />
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

export default CardListItemHeader;
