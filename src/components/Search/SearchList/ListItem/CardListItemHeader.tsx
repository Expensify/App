import AccountAvatarWithCardFeed from '@components/Avatar/connected/AccountAvatarWithCardFeed';
import Checkbox from '@components/Checkbox';
import type {SearchColumnType} from '@components/Search/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {TransactionCardGroupListItemType} from './types';

import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import TextCell from './TextCell';
import TotalCell from './TotalCell';

type CardListItemHeaderProps = {
    card: TransactionCardGroupListItemType;
    onCheckboxPress?: (item: TransactionCardGroupListItemType) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    isFocused?: boolean;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    onDownArrowClick?: () => void;

    /** Whether the down arrow is expanded */
    isExpanded?: boolean;

    /** The visible columns for the header */
    columns?: SearchColumnType[];
};

function CardListItemHeader({
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
}: CardListItemHeaderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const formattedDisplayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: cardItem, translate, formatPhoneNumber});
    const backgroundColor =
        StyleUtils.getItemBackgroundColorStyle(!!cardItem.isSelected, !!isFocused, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ?? theme.highlightBG;

    const columnComponents: Partial<Record<SearchColumnType, React.JSX.Element>> = {
        [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.AVATAR}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)}
            >
                <UserDetailsTooltip accountID={cardItem.accountID}>
                    <View>
                        <AccountAvatarWithCardFeed
                            accountID={cardItem.accountID}
                            cardFeed={cardItem.bank}
                            borderColor={backgroundColor}
                            containerStyle={styles.mr0}
                            size={CONST.AVATAR_SIZE.SMALL}
                        />
                    </View>
                </UserDetailsTooltip>
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CARD)}
            >
                <View style={[styles.gapHalf, styles.flexShrink1]}>
                    <TextWithTooltip
                        text={cardItem.formattedCardName ?? ''}
                        numberOfLines={2}
                        style={[styles.preWrap]}
                        isSelectable
                    />
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
                    numberOfLines={2}
                    style={[styles.lineHeightLarge, styles.preWrap]}
                    isSelectable
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPENSES)}
            >
                <TextCell text={String(cardItem.count)} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL]: (
            <View
                key={CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL}
                style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, {shouldRemoveTotalColumnFlex: true})}
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
            <View style={[styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth ? [styles.pl3, styles.pv1, styles.gap3] : [styles.p4, styles.gap3]]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(cardItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            disabled={!!isDisabled || cardItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                            containerStyle={styles.m0}
                        />
                    )}
                    {!isLargeScreenWidth && (
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <AccountAvatarWithCardFeed
                                accountID={cardItem.accountID}
                                cardFeed={cardItem.bank}
                                borderColor={backgroundColor}
                                containerStyle={styles.mr0}
                            />
                            <View style={[styles.gap1, styles.flexShrink1]}>
                                <TextWithTooltip
                                    text={formattedDisplayName}
                                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                                    isSelectable
                                />
                                <TextWithTooltip
                                    text={cardItem.formattedCardName ?? ''}
                                    numberOfLines={2}
                                    style={[styles.textLabelSupporting, styles.lh16, styles.preWrap]}
                                    isSelectable
                                />
                            </View>
                        </View>
                    )}
                    {isLargeScreenWidth && columns?.map((column) => columnComponents[column])}
                </View>
                {!isLargeScreenWidth && (
                    <View style={[styles.flexShrink0, styles.flexRow, styles.alignItemsCenter]}>
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
