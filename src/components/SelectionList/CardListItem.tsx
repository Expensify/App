import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SelectCircle from '@components/SelectCircle';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {BankIcon} from '@src/types/onyx/Bank';
import BaseListItem from './BaseListItem';
import type {BaseListItemProps, ListItem} from './types';

type CardListItemProps<TItem extends ListItem> = BaseListItemProps<TItem & {bankIcon?: BankIcon; lastFourPAN?: string; isVirtual?: boolean}>;

function CardListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
}: CardListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    const subtitleText =
        `${item.lastFourPAN ? `${translate('paymentMethodList.accountLastFour')} ${item.lastFourPAN}` : ''}` +
        `${item.lastFourPAN && item.isVirtual ? ` ${CONST.DOT_SEPARATOR} ` : ''}` +
        `${item.isVirtual ? translate('workspace.expensifyCard.virtual') : ''}`;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, isFocused && styles.sidebarLinkActive]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
        >
            <>
                {item.bankIcon && (
                    <View style={[styles.mr3]}>
                        <Icon
                            src={item.bankIcon.icon}
                            width={item.bankIcon.iconWidth}
                            height={item.bankIcon.iconHeight}
                            additionalStyles={item.bankIcon.iconStyles}
                        />
                    </View>
                )}
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch, styles.optionRow]}>
                    <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip}
                            text={Str.removeSMSDomain(item.text ?? '')}
                            style={[
                                styles.optionDisplayName,
                                isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                                item.isBold !== false && styles.sidebarLinkTextBold,
                                styles.pre,
                                item.alternateText ? styles.mb1 : null,
                            ]}
                        />
                        {!!subtitleText && (
                            <TextWithTooltip
                                shouldShowTooltip={showTooltip}
                                text={subtitleText}
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                            />
                        )}
                    </View>
                </View>
                {canSelectMultiple && !item.isDisabled && (
                    <PressableWithFeedback
                        onPress={handleCheckboxPress}
                        disabled={isDisabled}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={item.text ?? ''}
                        style={[styles.ml2, styles.optionSelectCircle]}
                    >
                        <SelectCircle
                            isChecked={item.isSelected ?? false}
                            selectCircleStyles={styles.ml0}
                        />
                    </PressableWithFeedback>
                )}
            </>
        </BaseListItem>
    );
}

CardListItem.displayName = 'CardListItem';

export default CardListItem;
