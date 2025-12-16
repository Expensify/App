import React, {useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import ReportActionAvatars from '@components/ReportActionAvatars';
import type {ListItem, TransactionCardGroupListItemType} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';
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
    isExpanded,
}: CardListItemHeaderProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const formattedDisplayName = useMemo(() => formatPhoneNumber(getDisplayNameOrDefault(cardItem)), [cardItem, formatPhoneNumber]);
    const backgroundColor =
        StyleUtils.getItemBackgroundColorStyle(!!cardItem.isSelected, !!isFocused, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ?? theme.highlightBG;

    return (
        <View>
            <View style={[styles.pv1Half, styles.pl3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(cardItem as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
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
                                style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                            />
                            <TextWithTooltip
                                text={`${cardItem.cardName}${cardItem.lastFourPAN ? ` ${CONST.DOT_SEPARATOR} ` : ''}${cardItem.lastFourPAN}`}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        </View>
                    </View>
                </View>
                <View style={[styles.flexShrink0, styles.mr3, styles.gap1]}>
                    <TotalCell
                        total={cardItem.total}
                        currency={cardItem.currency}
                    />
                    {!isLargeScreenWidth && !!onDownArrowClick && (
                        <View>
                            <PressableWithFeedback
                                onPress={onDownArrowClick}
                                style={[styles.pl3, styles.justifyContentCenter, styles.alignItemsEnd]}
                                accessibilityRole={CONST.ROLE.BUTTON}
                                accessibilityLabel={isExpanded ? CONST.ACCESSIBILITY_LABELS.COLLAPSE : CONST.ACCESSIBILITY_LABELS.EXPAND}
                            >
                                {({hovered}) => (
                                    <Icon
                                        src={isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow}
                                        fill={theme.icon}
                                        additionalStyles={!hovered && styles.opacitySemiTransparent}
                                        small
                                    />
                                )}
                            </PressableWithFeedback>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

export default CardListItemHeader;
