import Badge from '@components/Badge';
import Button from '@components/Button';
import ConnectionStatusBadge from '@components/ConnectionStatusBadge';
import ConnectionStatusMessage from '@components/ConnectionStatusMessage';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import {getBankAccountState, hasBankAccountAllowDebit, isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import {clearAddPaymentMethodError, clearDeletePaymentMethodError} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankIcon} from '@src/types/onyx/Bank';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';

type ConnectionStatusDetails = {
    statusText: string;
    statusTone?: 'default' | 'success' | 'danger';
    tooltipText?: string;
    message?: string;
    actionText?: string;
    onActionPress?: (e: GestureResponderEvent | ReactKeyboardEvent | undefined) => void;
    isActionDisabled?: boolean;
    linkText?: string;
    onLinkPress?: (e: GestureResponderEvent | ReactKeyboardEvent) => void;
};

type PaymentMethodItem = PaymentMethod & {
    key?: string;
    title?: string;
    description: string;
    onPress?: (e: GestureResponderEvent | KeyboardEvent | undefined) => void;
    isGroupedCardDomain?: boolean;
    canDismissError?: boolean;
    disabled?: boolean;
    shouldShowRightIcon?: boolean;
    shouldShowThreeDotsMenu?: boolean;
    interactive?: boolean;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    errors?: Errors;
    iconRight?: IconAsset;
    isMethodActive?: boolean;
    isInactive?: boolean;
    cardID?: number;
    plaidUrl?: string;
    onThreeDotsMenuPress?: (e: GestureResponderEvent | KeyboardEvent | undefined) => void;
    isCardFrozen?: boolean;
    /** Whether the personal bank account is missing required personal info (name, address, phone) */
    isMissingPersonalInfo?: boolean;
    connectionStatus?: ConnectionStatusDetails;
    /** Whether to show the "Add details" CTA row below a virtual Expensify Card when personal details are missing */
    shouldShowMissingPersonalDetailsAction?: boolean;
} & BankIcon;

type PaymentMethodListItemProps = {
    /** The payment method item to render */
    item: PaymentMethodItem;

    /** Whether to show the default badge for this payment method */
    shouldShowDefaultBadge: boolean;

    /** Optional array of menu items to be displayed in the three dots menu */
    threeDotsMenuItems?: PopoverMenuItem[];

    /** Callback for when the three dots menu is pressed */
    onThreeDotsMenuPress?: (e: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /** List item style */
    listItemStyle?: StyleProp<ViewStyle>;
};

function dismissError(item: PaymentMethodItem) {
    if (item.cardID) {
        clearDeletePaymentMethodError(ONYXKEYS.CARD_LIST, item.cardID);
        return;
    }

    const hasErrors = !isEmptyObject(item.errors);
    const isBankAccount = item.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT;
    const paymentList = isBankAccount ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST;
    const paymentID = isBankAccount ? item.accountData?.bankAccountID : item.accountData?.fundID;

    if (!paymentID) {
        Log.info('Unable to clear payment method error: ', undefined, item);
        return;
    }

    if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || hasErrors) {
        clearDeletePaymentMethodError(paymentList, paymentID);
        if (!isBankAccount) {
            clearDeletePaymentMethodError(ONYXKEYS.FUND_LIST, paymentID);
        }
    } else {
        clearAddPaymentMethodError(paymentList, paymentID);
        if (!isBankAccount) {
            clearAddPaymentMethodError(ONYXKEYS.FUND_LIST, paymentID);
        }
    }
}

function isAccountInSetupState(account: PaymentMethodItem) {
    return isBankAccountPartiallySetup(getBankAccountState(account.accountData));
}

function isBusinessBankAccountLocked(account: PaymentMethodItem) {
    return getBankAccountState(account.accountData) === CONST.BANK_ACCOUNT.STATE.LOCKED && hasBankAccountAllowDebit(account.accountData);
}

function isAccountNeedingAction(account: PaymentMethodItem) {
    return isAccountInSetupState(account) || !!account.isMissingPersonalInfo;
}

function PaymentMethodListItem({item, shouldShowDefaultBadge, threeDotsMenuItems, listItemStyle}: PaymentMethodListItemProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'FreezeCard', 'QuestionMark']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const threeDotsMenuRef = useRef<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean; onThreeDotsPress: () => void}>(null);
    const isInLockedState = isBusinessBankAccountLocked(item);
    const showThreeDotsMenu = item.shouldShowThreeDotsMenu !== false && !!threeDotsMenuItems && !isInLockedState;
    const isNeedingAction = isAccountNeedingAction(item);
    const connectionStatus = item.connectionStatus;

    // Check if this is a Chase personal bank account connected via Plaid
    const isChaseAccountConnectedViaPlaid =
        item.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT &&
        item.accountData?.additionalData?.bankName?.toLowerCase() === CONST.BANK_NAMES.CHASE &&
        !!(item.accountData?.additionalData?.plaidAccountID ?? item.accountData?.plaidAccountID);

    const handleRowPress = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (isInLockedState) {
            if (item.onThreeDotsMenuPress) {
                item.onThreeDotsMenuPress(e);
            } else {
                item.onPress?.(e);
            }
            return;
        }

        if (isNeedingAction || !showThreeDotsMenu || (item.cardID && item.onThreeDotsMenuPress)) {
            item.onPress?.(e);
        } else if (threeDotsMenuRef.current) {
            threeDotsMenuRef.current.onThreeDotsPress();
        }
    };

    let badgeText: string | undefined;
    if (item.connectionStatus) {
        badgeText = undefined;
    } else if (isInLockedState) {
        badgeText = translate('common.locked');
    } else if (isNeedingAction) {
        badgeText = translate('common.review');
    } else if (shouldShowDefaultBadge) {
        badgeText = translate('paymentMethodList.defaultPaymentMethod');
    }

    let badgeIcon: IconAsset | undefined;
    if (!item.connectionStatus && isInLockedState) {
        badgeIcon = icons.DotIndicator;
    }

    // Card state pills (below title, next to description)
    const descriptionAddon = useMemo(() => {
        if (item.connectionStatus) {
            return (
                <ConnectionStatusBadge
                    text={item.connectionStatus.statusText}
                    tone={item.connectionStatus.statusTone}
                    tooltipText={item.connectionStatus.tooltipText}
                />
            );
        }
        if (isNeedingAction && shouldShowDefaultBadge) {
            return (
                <Badge
                    text={translate('paymentMethodList.defaultPaymentMethod')}
                    isCondensed
                    badgeStyles={[styles.ml0]}
                />
            );
        }
        if (item.isCardFrozen) {
            return (
                <Badge
                    text={translate('cardPage.frozen')}
                    icon={icons.FreezeCard}
                    isCondensed
                    badgeStyles={[styles.ml0]}
                    iconStyles={[styles.mr1]}
                />
            );
        }
        if (item.isInactive) {
            return (
                <Badge
                    text={translate('walletPage.cardInactive')}
                    isCondensed
                    badgeStyles={[styles.ml0]}
                />
            );
        }
        return undefined;
    }, [isNeedingAction, shouldShowDefaultBadge, item.connectionStatus, item.isCardFrozen, item.isInactive, icons.FreezeCard, styles.ml0, styles.mr1, translate]);

    return (
        <OfflineWithFeedback
            onClose={item.canDismissError ? () => dismissError(item) : undefined}
            pendingAction={item.pendingAction}
            errors={item.errors}
            errorRowStyles={styles.paymentMethodErrorRow}
            shouldShowErrorMessages={!!item.errors && !connectionStatus?.message}
        >
            {connectionStatus ? (
                <Hoverable>
                    {(isHovered) => (
                        <View style={[isHovered && styles.hoveredComponentBG]}>
                            <MenuItem
                                onPress={handleRowPress}
                                title={item.title}
                                description={item.description}
                                descriptionAddon={descriptionAddon}
                                icon={item.icon}
                                plaidUrl={item.plaidUrl}
                                disabled={item.disabled}
                                iconType={item.plaidUrl ? CONST.ICON_TYPE_PLAID : CONST.ICON_TYPE_ICON}
                                displayInDefaultIconColor={!item.iconFill}
                                iconHeight={item.iconHeight ?? item.iconSize}
                                iconWidth={item.iconWidth ?? item.iconSize}
                                iconStyles={item.iconStyles}
                                iconFill={item.iconFill}
                                badgeText={badgeText}
                                badgeIcon={badgeIcon}
                                isBadgeSuccess={!connectionStatus && isNeedingAction ? true : undefined}
                                isBadgeError={!connectionStatus && isInLockedState}
                                wrapperStyle={[styles.paymentMethod, listItemStyle]}
                                iconRight={isNeedingAction ? undefined : item.iconRight}
                                shouldShowRightIcon={!showThreeDotsMenu && item.shouldShowRightIcon}
                                shouldShowRightComponent={showThreeDotsMenu}
                                rightComponent={
                                    showThreeDotsMenu ? (
                                        <View style={styles.alignSelfCenter}>
                                            <ThreeDotsMenu
                                                shouldSelfPosition
                                                onIconPress={item.onThreeDotsMenuPress ?? item.onPress}
                                                menuItems={threeDotsMenuItems}
                                                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                                shouldOverlay
                                                isNested
                                                threeDotsMenuRef={threeDotsMenuRef}
                                                disabled={item.disabled}
                                            />
                                        </View>
                                    ) : undefined
                                }
                                interactive={item.interactive}
                                shouldRemoveBackground
                                shouldRemoveHoverBackground
                                brickRoadIndicator={connectionStatus.message ? undefined : item.brickRoadIndicator}
                                success={item.isMethodActive}
                            />
                            {!!connectionStatus.message && (
                                <View style={styles.mb2}>
                                    <ConnectionStatusMessage
                                        message={connectionStatus.message}
                                        actionText={connectionStatus.actionText}
                                        onActionPress={connectionStatus.onActionPress ? () => connectionStatus.onActionPress?.(undefined) : undefined}
                                        isActionDisabled={connectionStatus.isActionDisabled}
                                        statusTone={connectionStatus.statusTone}
                                        linkText={connectionStatus.linkText}
                                        onLinkPress={connectionStatus.onLinkPress}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </Hoverable>
            ) : (
                <MenuItem
                    onPress={handleRowPress}
                    title={item.title}
                    description={item.description}
                    descriptionAddon={descriptionAddon}
                    icon={item.icon}
                    plaidUrl={item.plaidUrl}
                    disabled={item.disabled}
                    iconType={item.plaidUrl ? CONST.ICON_TYPE_PLAID : CONST.ICON_TYPE_ICON}
                    displayInDefaultIconColor={!item.iconFill}
                    iconHeight={item.iconHeight ?? item.iconSize}
                    iconWidth={item.iconWidth ?? item.iconSize}
                    iconStyles={item.iconStyles}
                    iconFill={item.iconFill}
                    badgeText={badgeText}
                    badgeIcon={badgeIcon}
                    isBadgeSuccess={isNeedingAction ? true : undefined}
                    isBadgeError={isInLockedState}
                    wrapperStyle={[styles.paymentMethod, listItemStyle]}
                    iconRight={isNeedingAction ? undefined : item.iconRight}
                    shouldShowRightIcon={!showThreeDotsMenu && item.shouldShowRightIcon}
                    shouldShowRightComponent={showThreeDotsMenu}
                    rightComponent={
                        showThreeDotsMenu ? (
                            <View style={styles.alignSelfCenter}>
                                <ThreeDotsMenu
                                    shouldSelfPosition
                                    onIconPress={item.onThreeDotsMenuPress ?? item.onPress}
                                    menuItems={threeDotsMenuItems}
                                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                    shouldOverlay
                                    isNested
                                    threeDotsMenuRef={threeDotsMenuRef}
                                    disabled={item.disabled}
                                />
                            </View>
                        ) : undefined
                    }
                    interactive={item.interactive}
                    brickRoadIndicator={item.brickRoadIndicator}
                    success={item.isMethodActive}
                />
            )}
            {!!item.shouldShowMissingPersonalDetailsAction && !!item.cardID && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.mr2]}>
                        <Icon
                            src={icons.DotIndicator}
                            fill={theme.success}
                            additionalStyles={[styles.mr2]}
                        />
                        <Text style={[styles.mutedNormalTextLabel, styles.label, styles.flexShrink1]}>{translate('walletPage.addVirtualCardPersonalDetails.subtitle')}</Text>
                    </View>
                    <Button
                        small
                        success
                        text={translate('walletPage.addVirtualCardPersonalDetails.cta')}
                        onPress={() => Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS.getRoute(String(item.cardID)))}
                    />
                </View>
            )}
            {isChaseAccountConnectedViaPlaid && (
                <View style={[styles.pb3, shouldUseNarrowLayout ? styles.pl5 : styles.pl8]}>
                    <PressableWithFeedback
                        onPress={() => openExternalLink(CONST.CHASE_ACCOUNT_NUMBER_HELP_URL)}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.alignSelfStart]}
                        accessibilityLabel={translate('walletPage.chaseAccountNumberDifferent')}
                        role={CONST.ROLE.LINK}
                        sentryLabel={CONST.SENTRY_LABEL.PAYMENT_METHOD_LIST_ITEM.CHASE_ACCOUNT_HELP}
                    >
                        <Icon
                            src={icons.QuestionMark}
                            height={variables.iconSizeSmall}
                            width={variables.iconSizeSmall}
                            fill={theme.textSupporting}
                            additionalStyles={[styles.mr1]}
                        />
                        <Text style={[styles.mutedNormalTextLabel, styles.label]}>{translate('walletPage.chaseAccountNumberDifferent')}</Text>
                    </PressableWithFeedback>
                </View>
            )}
        </OfflineWithFeedback>
    );
}

export type {PaymentMethodItem};
export default PaymentMethodListItem;
