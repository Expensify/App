import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import BaseListItem from '@components/SelectionListWithSections/BaseListItem';
import type {BaseListItemProps, ListItem} from '@components/SelectionListWithSections/types';
import TextWithTooltip from '@components/TextWithTooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {BankIcon} from '@src/types/onyx/Bank';

type AdditionalCardProps = {
    shouldShowOwnersAvatar?: boolean;
    cardOwnerPersonalDetails?: PersonalDetails;
    bankIcon?: BankIcon;
    lastFourPAN?: string;
    isVirtual?: boolean;
    cardName?: string;
    plaidUrl?: string;
};
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
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
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
        source: item.cardOwnerPersonalDetails?.avatar ?? icons.FallbackAvatar,
        id: item.cardOwnerPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
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
                                    accountID={Number(item.cardOwnerPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID)}
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
                                    {!!item?.plaidUrl && (
                                        <PlaidCardFeedIcon
                                            plaidUrl={item.plaidUrl}
                                            isSmall
                                        />
                                    )}
                                    {!item?.plaidUrl && (
                                        <Icon
                                            src={item.bankIcon.icon}
                                            width={variables.cardMiniatureWidth}
                                            height={variables.cardMiniatureHeight}
                                            additionalStyles={styles.cardMiniature}
                                        />
                                    )}
                                </View>
                            </View>
                        ) : (
                            <>
                                {!!item?.plaidUrl && <PlaidCardFeedIcon plaidUrl={item.plaidUrl} />}
                                {!item?.plaidUrl && (
                                    <Icon
                                        src={item.bankIcon.icon}
                                        width={variables.cardIconWidth}
                                        height={variables.cardIconHeight}
                                        additionalStyles={styles.cardIcon}
                                    />
                                )}
                            </>
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
                    <Checkbox
                        shouldSelectOnPressEnter
                        isChecked={item.isSelected ?? false}
                        accessibilityLabel={item.text ?? ''}
                        onPress={handleCheckboxPress}
                        disabled={!!isDisabled}
                        style={styles.ml3}
                    />
                )}
            </>
        </BaseListItem>
    );
}

export default CardListItem;
export type {AdditionalCardProps};
