import React, {useCallback, useRef} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import {clearAddPaymentMethodError, clearDeletePaymentMethodError} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankIcon} from '@src/types/onyx/Bank';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';
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
    item: PaymentMethodItem;
    shouldShowDefaultBadge: boolean;
    threeDotsMenuItems?: PopoverMenuItem[];
    onThreeDotsMenuPress?: (e: GestureResponderEvent | KeyboardEvent | undefined) => void;
    listItemStyle?: StyleProp<ViewStyle>;
    selectedMethodID?: string | number;
};

function dismissError(item: PaymentMethodItem) {
    if (item.cardID) {
        clearDeletePaymentMethodError(ONYXKEYS.CARD_LIST, item.cardID);
        return;
    }

    const isBankAccount = item.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT;
    const paymentList = isBankAccount ? ONYXKEYS.BANK_ACCOUNT_LIST : ONYXKEYS.FUND_LIST;
    const paymentID = isBankAccount ? item.accountData?.bankAccountID : item.accountData?.fundID;

    if (!paymentID) {
        Log.info('Unable to clear payment method error: ', undefined, item);
        return;
    }

    if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
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
    return !!(account.accountData && 'state' in account.accountData && account.accountData.state === CONST.BANK_ACCOUNT.STATE.SETUP);
}

function PaymentMethodListItem({item, shouldShowDefaultBadge, threeDotsMenuItems, listItemStyle, selectedMethodID}: PaymentMethodListItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const threeDotsMenuRef = useRef<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean; onThreeDotsPress: () => void}>(null);

    const handleRowPress = (e: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (isAccountInSetupState(item) || !threeDotsMenuItems) {
            item.onPress?.(e);
        } else if (threeDotsMenuRef.current) {
            threeDotsMenuRef.current.onThreeDotsPress();
        }
    };

    const getBadgeText = useCallback(
        (item: PaymentMethodItem) => {
            if (isAccountInSetupState(item)) {
                return translate('common.actionRequired');
            }
            return shouldShowDefaultBadge ? translate('paymentMethodList.defaultPaymentMethod') : undefined;
        },
        [shouldShowDefaultBadge, translate],
    );

    return (
        <OfflineWithFeedback
            onClose={() => dismissError(item)}
            pendingAction={item.pendingAction}
            errors={item.errors}
            errorRowStyles={styles.ph6}
            canDismissError={item.canDismissError}
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
                badgeIcon={isAccountInSetupState(item) ? Expensicons.DotIndicator : undefined}
                badgeSuccess={isAccountInSetupState(item) ? true : undefined}
                wrapperStyle={[styles.paymentMethod, listItemStyle]}
                iconRight={item.iconRight}
                shouldShowRightIcon={!threeDotsMenuItems && item.shouldShowRightIcon}
                shouldShowRightComponent={!!threeDotsMenuItems}
                rightComponent={
                    threeDotsMenuItems && item.onThreeDotsMenuPress ? (
                        <ThreeDotsMenu
                            shouldSelfPosition
                            onIconPress={item.onThreeDotsMenuPress}
                            menuItems={threeDotsMenuItems}
                            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                            shouldOverlay
                            isNested
                            threeDotsMenuRef={threeDotsMenuRef}
                        />
                    ) : undefined
                }
                isSelected={selectedMethodID?.toString() === item.methodID?.toString()}
                interactive={item.interactive}
                brickRoadIndicator={item.brickRoadIndicator}
                success={item.isMethodActive}
            />
        </OfflineWithFeedback>
    );
}

export type {PaymentMethodItem};
export default PaymentMethodListItem;
