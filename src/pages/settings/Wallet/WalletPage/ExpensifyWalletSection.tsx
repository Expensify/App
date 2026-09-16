import ActivityIndicator from '@components/ActivityIndicator';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {PaymentMethodType, Source} from '@components/KYCWall/types';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {clearWalletTermsError} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Account, WalletTerms} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {ForwardedRef, RefObject} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useContext} from 'react';

import useWalletLoadingSpinner from './useWalletLoadingSpinner';
import WalletActivationStatus from './WalletActivationStatus';

const isUserValidatedSelector = (account: OnyxEntry<Account>) => account?.validated ?? false;

const ACTIVATED_WALLET_TIERS = new Set<string>([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM]);

function ExpensifyWalletSection() {
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [walletTerms = getEmptyObject<WalletTerms>()] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [isUserValidated = false] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const {convertToDisplayString} = useCurrencyListActions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Wallet', 'Transfer', 'Hourglass', 'Exclamation']);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const kycWallRef = useContext(KYCWallContext);
    const shouldShowLoadingSpinner = useWalletLoadingSpinner();

    const hasActivatedWallet = ACTIVATED_WALLET_TIERS.has(userWallet?.tierName ?? '');
    const isPendingOnfidoResult = userWallet?.isPendingOnfidoResult ?? false;
    const hasFailedOnfido = userWallet?.hasFailedOnfido ?? false;
    const formattedBalance = convertToDisplayString(userWallet?.currentBalance ?? 0, CONST.CURRENCY.USD);
    const walletActionWrapperStyle = [styles.transferBalance, shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8, shouldUseNarrowLayout ? styles.ph5 : styles.ph8];

    /**
     * Navigate to the appropriate page after completing the KYC flow, depending on what initiated it
     */
    const navigateToWalletOrTransferBalancePage = (_iouPaymentType?: PaymentMethodType, source?: Source) => {
        Navigation.navigate(source === CONST.KYC_WALL_SOURCE.ENABLE_WALLET ? ROUTES.SETTINGS_WALLET : ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE);
    };

    const onEnableWalletPress = () => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        if (!isUserValidated) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path));
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute());
    };

    return (
        <Section
            subtitle={translate(`walletPage.sendAndReceiveMoney`)}
            title={translate('walletPage.expensifyWallet')}
            isCentralPane
            subtitleMuted
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={shouldShowLoadingSpinner ? styles.mt7 : styles.mt5}
        >
            <>
                {shouldShowLoadingSpinner && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.mb5]}
                    />
                )}
                {!shouldShowLoadingSpinner && hasActivatedWallet && (
                    <OfflineWithFeedback
                        pendingAction={CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}
                        errors={walletTerms?.errors}
                        onClose={clearWalletTermsError}
                        errorRowStyles={[styles.ml10, styles.mr2]}
                        style={[styles.mb2]}
                    >
                        <MenuItemWithTopDescription
                            description={translate('walletPage.balance')}
                            title={formattedBalance}
                            titleStyle={styles.textHeadlineH2}
                            interactive={false}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                            copyValue={formattedBalance}
                            copyable
                        />
                    </OfflineWithFeedback>
                )}

                <KYCWall
                    ref={kycWallRef}
                    onSuccessfulKYC={navigateToWalletOrTransferBalancePage}
                    // Wallet cannot pass personalBankAccountOnSuccessFallbackRoute via triggerKYCFlow like pay flows do, because the fallback route
                    // depends on wallet-specific state (hasActivatedWallet) and is only known when the user selects "Personal bank account".
                    // To allow upgrading to a gold wallet, continue with the KYC flow after adding a bank account
                    getPersonalBankAccountOnSuccessFallbackRoute={(selectedPaymentMethod) =>
                        !hasActivatedWallet && selectedPaymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? ROUTES.SETTINGS_WALLET : undefined
                    }
                    enablePaymentsRoute={ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute()}
                    addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                    source={hasActivatedWallet ? CONST.KYC_WALL_SOURCE.TRANSFER_BALANCE : CONST.KYC_WALL_SOURCE.ENABLE_WALLET}
                    shouldIncludeDebitCard={hasActivatedWallet}
                >
                    {(triggerKYCFlow, buttonRef: RefObject<View | null>) => {
                        if (shouldShowLoadingSpinner) {
                            return null;
                        }

                        if (hasActivatedWallet) {
                            return (
                                <MenuItem
                                    ref={buttonRef as ForwardedRef<View>}
                                    title={translate('common.transferBalance')}
                                    icon={icons.Transfer}
                                    onPress={(event) => {
                                        triggerKYCFlow({event});
                                    }}
                                    shouldShowRightIcon
                                    wrapperStyle={walletActionWrapperStyle}
                                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.TRANSFER_BALANCE}
                                />
                            );
                        }

                        if (isPendingOnfidoResult) {
                            return (
                                <WalletActivationStatus
                                    icon={icons.Hourglass}
                                    text={translate('walletPage.walletActivationPending')}
                                />
                            );
                        }

                        if (hasFailedOnfido) {
                            return (
                                <WalletActivationStatus
                                    icon={icons.Exclamation}
                                    text={translate('walletPage.walletActivationFailed')}
                                />
                            );
                        }

                        return (
                            <MenuItem
                                title={translate('walletPage.enableWallet')}
                                icon={icons.Wallet}
                                ref={buttonRef as ForwardedRef<View>}
                                onPress={onEnableWalletPress}
                                wrapperStyle={walletActionWrapperStyle}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.ENABLE_WALLET}
                            />
                        );
                    }}
                </KYCWall>
            </>
        </Section>
    );
}

export default ExpensifyWalletSection;
