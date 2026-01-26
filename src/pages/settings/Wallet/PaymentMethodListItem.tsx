import React, {useCallback, useMemo, useRef} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
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
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import Log from '@libs/Log';
import variables from '@styles/variables';
import {clearAddPaymentMethodError, clearDeletePaymentMethodError} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    interactive?: boolean;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    errors?: Errors;
    iconRight?: IconAsset;
    isMethodActive?: boolean;
    cardID?: number;
    plaidUrl?: string;
    onThreeDotsMenuPress?: (e: GestureResponderEvent | KeyboardEvent | undefined) => void;
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

function PaymentMethodListItem({item, shouldShowDefaultBadge, threeDotsMenuItems, listItemStyle}: PaymentMethodListItemProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'QuestionMark']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const threeDotsMenuRef = useRef<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean; onThreeDotsPress: () => void}>(null);

    // Check if this is a Chase personal bank account connected via Plaid
    // Chase substitutes tokenized account numbers for accounts linked via Plaid
    const isChaseAccountConnectedViaPlaid = useMemo(() => {
        return (
            item.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT &&
            item.accountData?.additionalData?.bankName?.toLowerCase() === CONST.BANK_NAMES.CHASE &&
            !!(item.accountData?.additionalData?.plaidAccountID ?? item.accountData?.plaidAccountID)
        );
    }, [item.accountType, item.accountData]);

    const handleRowPress = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (isAccountInSetupState(item) || !threeDotsMenuItems || (item.cardID && item.onThreeDotsMenuPress)) {
            item.onPress?.(e);
        } else if (threeDotsMenuRef.current) {
            threeDotsMenuRef.current.onThreeDotsPress();
        }
    };

    const getBadgeText = useCallback(
        (listItem: PaymentMethodItem) => {
            if (isAccountInSetupState(listItem)) {
                return translate('common.actionRequired');
            }
            return shouldShowDefaultBadge ? translate('paymentMethodList.defaultPaymentMethod') : undefined;
        },
        [shouldShowDefaultBadge, translate],
    );

    return (
        <OfflineWithFeedback
            onClose={item.canDismissError ? () => dismissError(item) : undefined}
            pendingAction={item.pendingAction}
            errors={item.errors}
            errorRowStyles={styles.paymentMethodErrorRow}
        >
            <MenuItem
                onPress={handleRowPress}
                title={item.title}
                description={item.description}
                icon={item.icon}
                plaidUrl={item.plaidUrl}
                disabled={item.disabled}
                iconType={item.plaidUrl ? CONST.ICON_TYPE_PLAID : CONST.ICON_TYPE_ICON}
                displayInDefaultIconColor
                iconHeight={item.iconHeight ?? item.iconSize}
                iconWidth={item.iconWidth ?? item.iconSize}
                iconStyles={item.iconStyles}
                badgeText={getBadgeText(item)}
                badgeIcon={isAccountInSetupState(item) ? icons.DotIndicator : undefined}
                badgeSuccess={isAccountInSetupState(item) ? true : undefined}
                wrapperStyle={[styles.paymentMethod, listItemStyle]}
                iconRight={item.iconRight}
                shouldShowRightIcon={!threeDotsMenuItems && item.shouldShowRightIcon}
                shouldShowRightComponent={!!threeDotsMenuItems}
                rightComponent={
                    threeDotsMenuItems ? (
                        <View style={styles.alignSelfCenter}>
                            <ThreeDotsMenu
                                shouldSelfPosition
                                onIconPress={item.onThreeDotsMenuPress ?? item.onPress}
                                menuItems={threeDotsMenuItems}
                                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                shouldOverlay
                                isNested
                                threeDotsMenuRef={threeDotsMenuRef}
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
