import React, {useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import ReportActionAvatars from '@components/ReportActionAvatars';
import type {ListItem, TransactionCardGroupListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';
import ActionCell from './ActionCell';
import TotalCell from './TotalCell';

type CardListItemHeaderProps<TItem extends ListItem> = {
    /** The card currently being looked at */
    card: TransactionCardGroupListItemType;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether the item is focused */
    isFocused?: boolean;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;
};

function CardListItemHeader<TItem extends ListItem>({card: cardItem, onSelectRow, onCheckboxPress, isDisabled, isFocused, canSelectMultiple}: CardListItemHeaderProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const formattedDisplayName = useMemo(() => formatPhoneNumber(getDisplayNameOrDefault(cardItem)), [cardItem, formatPhoneNumber]);
    const backgroundColor =
        StyleUtils.getItemBackgroundColorStyle(!!cardItem.isSelected, !!isFocused, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ?? theme.highlightBG;
    const shouldShowAction = isLargeScreenWidth;

    return (
        <View>
            <View style={[styles.pv1Half, styles.ph3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(cardItem as unknown as TItem)}
                            isChecked={cardItem.isSelected}
                            disabled={!!isDisabled || cardItem.isDisabledCheckbox}
                            accessibilityLabel={translate('common.select')}
                        />
                    )}
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
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}
                            />
                            <TextWithTooltip
                                text={`${cardItem.cardName} • ${cardItem.lastFourPAN}`}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.flexShrink0, styles.mr3]}>
                    <TotalCell
                        total={cardItem.total}
                        currency={cardItem.currency}
                    />
                </View>
                {shouldShowAction && (
                    <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                        <ActionCell
                            action={CONST.SEARCH.ACTION_TYPES.VIEW}
                            goToItem={() => onSelectRow(cardItem as unknown as TItem)}
                            isSelected={cardItem.isSelected}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

CardListItemHeader.displayName = 'CardListItemHeader';

export default CardListItemHeader;
