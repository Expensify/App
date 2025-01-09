import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import SelectCircle from '@components/SelectCircle';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {BaseListItemProps, ListItem} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {BankIcon} from '@src/types/onyx/Bank';

type AdditionalCardProps = {shouldShowOwnersAvatar?: boolean; cardOwnerPersonalDetails?: PersonalDetails; bankIcon?: BankIcon; lastFourPAN?: string; isVirtual?: boolean; cardName?: string};
type CardListItemProps<TItem extends ListItem> = BaseListItemProps<TItem & AdditionalCardProps>;

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
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();

    const handleCheckboxPress = useCallback(() => {
        if (onCheckboxPress) {
            onCheckboxPress(item);
        } else {
            onSelectRow(item);
        }
    }, [item, onCheckboxPress, onSelectRow]);

    const ownersAvatar = {
        source: item.cardOwnerPersonalDetails?.avatar ?? FallbackAvatar,
        id: item.cardOwnerPersonalDetails?.accountID ?? -1,
        type: CONST.ICON_TYPE_AVATAR,
        name: item.cardOwnerPersonalDetails?.displayName ?? '',
        fallbackIcon: item.cardOwnerPersonalDetails?.fallbackIcon,
    };

    const subtitleText =
        `${item.lastFourPAN ? `${item.lastFourPAN}` : ''}` +
        `${item.cardName ? ` ${CONST.DOT_SEPARATOR} ${item.cardName}` : ''}` +
        `${item.isVirtual ? ` ${CONST.DOT_SEPARATOR} ${translate('workspace.expensifyCard.virtual')}` : ''}`;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow]}
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
                {!!item.bankIcon && (
                    <View style={[styles.mr3]}>
                        {item.shouldShowOwnersAvatar ? (
                            <View>
                                <UserDetailsTooltip
                                    shouldRender={showTooltip}
                                    accountID={Number(item.cardOwnerPersonalDetails?.accountID ?? -1)}
                                    icon={ownersAvatar}
                                    fallbackUserDetails={{
                                        displayName: item.cardOwnerPersonalDetails?.displayName,
                                    }}
                                >
                                    <View>
                                        <Avatar
                                            containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT))}
                                            source={ownersAvatar.source}
                                            name={ownersAvatar.name}
                                            avatarID={ownersAvatar.id}
                                            type={CONST.ICON_TYPE_AVATAR}
                                            fallbackIcon={ownersAvatar.fallbackIcon}
                                        />
                                    </View>
                                </UserDetailsTooltip>
                                <View style={[styles.cardItemSecondaryIconStyle, StyleUtils.getBorderColorStyle(theme.componentBG)]}>
                                    <Icon
                                        src={item.bankIcon.icon}
                                        width={variables.cardMiniatureWidth}
                                        height={variables.cardMiniatureHeight}
                                        additionalStyles={styles.cardMiniature}
                                        fill={theme.componentBG}
                                    />
                                </View>
                            </View>
                        ) : (
                            <Icon
                                src={item.bankIcon.icon}
                                width={variables.cardIconWidth}
                                height={variables.cardIconHeight}
                                additionalStyles={styles.cardIcon}
                            />
                        )}
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
                {!!canSelectMultiple && !item.isDisabled && (
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
export type {AdditionalCardProps};
