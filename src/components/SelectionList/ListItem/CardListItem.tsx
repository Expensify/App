import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import Icon from '@components/Icon';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import TextWithTooltip from '@components/TextWithTooltip';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {BankIcon} from '@src/types/onyx/Bank';

import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import type {ListItem, SelectableListItemProps} from './types';

import SelectableListItem from './SelectableListItem';

type AdditionalCardProps = {
    shouldShowOwnersAvatar?: boolean;
    cardOwnerPersonalDetails?: PersonalDetails;
    bankIcon?: BankIcon;
    lastFourPAN?: string;
    isVirtual?: boolean;
    cardName?: string;
    plaidUrl?: string;
};
type CardListItemProps<TItem extends ListItem> = SelectableListItemProps<TItem & AdditionalCardProps>;

/**
 * A row with a bank/card icon (or owner avatar with card miniature), card name, and last-four
 * subtitle. Used in card selection and filtering (e.g. search filters, spend rules).
 */
function CardListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onSelectionButtonPress,
    onDismissError,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
}: CardListItemProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();

    const subtitleText =
        `${item.lastFourPAN ? `${item.lastFourPAN}` : ''}` +
        `${item.cardName ? ` ${CONST.DOT_SEPARATOR} ${item.cardName}` : ''}` +
        `${item.isVirtual ? ` ${CONST.DOT_SEPARATOR} ${translate('workspace.expensifyCard.virtual')}` : ''}`;

    return (
        <SelectableListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onSelectionButtonPress={onSelectionButtonPress}
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
                                <AvatarTooltipsProvider isEnabled={showTooltip}>
                                    <AccountAvatar
                                        accountID={item.cardOwnerPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                                        fallbackDisplayName={item.cardOwnerPersonalDetails?.displayName}
                                    />
                                </AvatarTooltipsProvider>
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
                                styles.sidebarLinkText,
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
            </>
        </SelectableListItem>
    );
}

export default CardListItem;
export type {AdditionalCardProps};
