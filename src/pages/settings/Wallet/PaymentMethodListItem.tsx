import React, {useMemo, useRef} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import Button from '@components/Button';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {clearAddPaymentMethodError, clearDeletePaymentMethodError} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {BankIcon} from '@src/types/onyx/Bank';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

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
    /** Pre-resolved status label (Active / Incomplete / Pending / Verifying / Locked / Inactive). When set, drives the badge text. */
    statusLabel?: string;
    /** Visual tone for the status badge. Omit to render a neutral badge (used for Incomplete / Pending / Verifying). */
    statusTone?: 'success' | 'error';
    /** Helper copy rendered beneath the row (e.g. "Finish adding bank account"). */
    helperText?: string;
    /** Optional link label embedded in the helper copy. When set, replaces helperText with a single TextLink. */
    helperLinkText?: string;
    /** Route navigated to when the helper link is pressed. */
    helperLinkRoute?: string;
    /** Formatted "Last synced …" line rendered beneath the row, below the helper copy. */
    lastSyncText?: string;
    /** Inline CTA button label (Finish / Confirm / Unlock / Fix). */
    inlineActionLabel?: string;
    /** Inline CTA button onPress. */
    inlineActionOnPress?: () => void;
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
    return !!(account.accountData && 'state' in account.accountData && isBankAccountPartiallySetup(account.accountData.state));
}

function isBusinessBankAccountLocked(account: PaymentMethodItem) {
    return account.accountData && 'state' in account.accountData && account.accountData.state === CONST.BANK_ACCOUNT.STATE.LOCKED && account.accountData.allowDebit;
}

function isAccountNeedingAction(account: PaymentMethodItem) {
    return isAccountInSetupState(account) || !!account.isMissingPersonalInfo;
}

function renderHelperCopy(item: PaymentMethodItem, styles: ReturnType<typeof useThemeStyles>) {
    if (item.helperLinkText && item.helperLinkRoute) {
        return (
            <TextLink
                style={[styles.mutedNormalTextLabel, styles.label]}
                onPress={() => {
                    if (!item.helperLinkRoute) {
                        return;
                    }
                    Navigation.navigate(item.helperLinkRoute as Route);
                }}
            >
                {item.helperLinkText}
            </TextLink>
        );
    }
    if (item.helperText) {
        return <Text style={[styles.mutedNormalTextLabel, styles.label]}>{item.helperText}</Text>;
    }
    return null;
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

    let badgeText;
    if (item.statusLabel) {
        badgeText = item.statusLabel;
    } else if (isInLockedState) {
        badgeText = translate('common.locked');
    } else if (isNeedingAction) {
        badgeText = translate('common.review');
    } else if (shouldShowDefaultBadge) {
        badgeText = translate('paymentMethodList.defaultPaymentMethod');
    }

    let badgeIcon;
    if (item.statusLabel ? item.statusTone === 'error' : isInLockedState) {
        badgeIcon = icons.DotIndicator;
    }

    let isBadgeSuccess: boolean | undefined;
    if (item.statusLabel) {
        isBadgeSuccess = item.statusTone === 'success';
    } else if (isNeedingAction) {
        isBadgeSuccess = true;
    }
    const isBadgeError = item.statusLabel ? item.statusTone === 'error' : isInLockedState;

    const hasFooter = !!(item.helperText ?? item.helperLinkText ?? item.lastSyncText ?? item.inlineActionLabel);

    // Card state pills (below title, next to description)
    const descriptionAddon = useMemo(() => {
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
    }, [isNeedingAction, shouldShowDefaultBadge, item.isCardFrozen, item.isInactive, icons.FreezeCard, styles.ml0, styles.mr1, translate]);

    return (
        <OfflineWithFeedback
            onClose={item.canDismissError ? () => dismissError(item) : undefined}
            pendingAction={item.pendingAction}
            errors={item.errors}
            errorRowStyles={styles.paymentMethodErrorRow}
            shouldShowErrorMessages={!!item.errors}
        >
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
                isBadgeSuccess={isBadgeSuccess}
                isBadgeError={isBadgeError}
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
            {hasFooter && (
                <View style={[styles.pb3, shouldUseNarrowLayout ? styles.pl5 : styles.pl8, styles.pr5, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={styles.flexShrink1}>
                        {renderHelperCopy(item, styles)}
                        {!!item.lastSyncText && <Text style={[styles.mutedNormalTextLabel, styles.label]}>{item.lastSyncText}</Text>}
                    </View>
                    {!!item.inlineActionLabel && !!item.inlineActionOnPress && (
                        <Button
                            small
                            text={item.inlineActionLabel}
                            onPress={item.inlineActionOnPress}
                        />
                    )}
                </View>
            )}
        </OfflineWithFeedback>
    );
}

export type {PaymentMethodItem};
export default PaymentMethodListItem;
