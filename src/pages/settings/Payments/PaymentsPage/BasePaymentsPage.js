import React from 'react';
import {
    ActivityIndicator, View, InteractionManager, LayoutAnimation,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import PaymentMethodList from '../PaymentMethodList';
import ROUTES from '../../../../ROUTES';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import PasswordPopover from '../../../../components/PasswordPopover';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import withLocalize from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import Popover from '../../../../components/Popover';
import MenuItem from '../../../../components/MenuItem';
import Text from '../../../../components/Text';
import * as PaymentMethods from '../../../../libs/actions/PaymentMethods';
import getClickedTargetLocation from '../../../../libs/getClickedTargetLocation';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import CurrentWalletBalance from '../../../../components/CurrentWalletBalance';
import ONYXKEYS from '../../../../ONYXKEYS';
import Permissions from '../../../../libs/Permissions';
import AddPaymentMethodMenu from '../../../../components/AddPaymentMethodMenu';
import CONST from '../../../../CONST';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import KYCWall from '../../../../components/KYCWall';
import {propTypes, defaultProps} from './paymentsPagePropTypes';
import {withNetwork} from '../../../../components/OnyxProvider';
import * as PaymentUtils from '../../../../libs/PaymentUtils';
import OfflineWithFeedback from '../../../../components/OfflineWithFeedback';
import ConfirmContent from '../../../../components/ConfirmContent';
import Button from '../../../../components/Button';
import themeColors from '../../../../styles/themes/default';

class BasePaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            shouldShowAddPaymentMenu: false,
            shouldShowDefaultDeleteMenu: false,
            shouldShowPasswordPrompt: false,
            shouldShowLoadingSpinner: true,
            isSelectedPaymentMethodDefault: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {
                title: '',
            },
            anchorPositionTop: 0,
            anchorPositionBottom: 0,
            anchorPositionRight: 0,
            addPaymentMethodButton: null,
            methodID: null,
            showConfirmDeleteContent: false,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
        this.hideDefaultDeleteMenu = this.hideDefaultDeleteMenu.bind(this);
        this.makeDefaultPaymentMethod = this.makeDefaultPaymentMethod.bind(this);
        this.deletePaymentMethod = this.deletePaymentMethod.bind(this);
        this.hidePasswordPrompt = this.hidePasswordPrompt.bind(this);
        this.navigateToTransferBalancePage = this.navigateToTransferBalancePage.bind(this);
        this.setMenuPosition = this.setMenuPosition.bind(this);
        this.listHeaderComponent = this.listHeaderComponent.bind(this);

        this.debounceSetShouldShowLoadingSpinner = _.debounce(this.setShouldShowLoadingSpinner.bind(this), CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (this.shouldListenForResize) {
            this.setMenuPosition();
        }

        // If the user was previously offline, skip debouncing showing the loader
        if (prevProps.network.isOffline && !this.props.network.isOffline) {
            this.setShouldShowLoadingSpinner();
        } else {
            this.debounceSetShouldShowLoadingSpinner();
        }

        // previously online OR currently offline, skip fetch
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        this.fetchData();
    }

    setShouldShowLoadingSpinner() {
        this.setState({shouldShowLoadingSpinner: this.props.isLoadingPaymentMethods && !this.props.network.isOffline});
    }

    setMenuPosition() {
        if (!this.state.addPaymentMethodButton) {
            return;
        }
        const buttonPosition = getClickedTargetLocation(this.state.addPaymentMethodButton);
        this.setPositionAddPaymentMenu(buttonPosition);
    }

    getSelectedPaymentMethodID() {
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            return CONST.PAYMENT_METHODS.PAYPAL;
        }
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            return this.state.selectedPaymentMethod.bankAccountID;
        }
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            return this.state.selectedPaymentMethod.fundID;
        }
    }

    /**
     * Set position of the payment menu
     *
     * @param {Object} position
     */
    setPositionAddPaymentMenu(position) {
        this.setState({
            anchorPositionTop: position.top + position.height,
            anchorPositionBottom: this.props.windowHeight - position.top,

            // We want the position to be 13px to the right of the left border
            anchorPositionRight: (this.props.windowWidth - position.right) + 13,
        });
    }

    /**
     * Display the delete/default menu, or the add payment method menu
     *
     * @param {Object} nativeEvent
     * @param {String} accountType
     * @param {String} account
     * @param {Boolean} isDefault
     * @param {String|Number} methodID
     */
    paymentMethodPressed(nativeEvent, accountType, account, isDefault, methodID) {
        const position = getClickedTargetLocation(nativeEvent.currentTarget);
        this.setState({
            addPaymentMethodButton: nativeEvent.currentTarget,
        });

        // The delete/default menu
        if (accountType) {
            let formattedSelectedPaymentMethod;
            if (accountType === CONST.PAYMENT_METHODS.PAYPAL) {
                formattedSelectedPaymentMethod = {
                    title: 'PayPal.me',
                    icon: account.icon,
                    description: account.username,
                    type: CONST.PAYMENT_METHODS.PAYPAL,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: account.addressName,
                    icon: account.icon,
                    description: `${this.props.translate('paymentMethodList.accountLastFour')} ${account.accountNumber.slice(-4)}`,
                    type: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
                };
            } else if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                formattedSelectedPaymentMethod = {
                    title: account.addressName,
                    icon: account.icon,
                    description: `${this.props.translate('paymentMethodList.cardLastFour')} ${account.cardNumber.slice(-4)}`,
                    type: CONST.PAYMENT_METHODS.DEBIT_CARD,
                };
            }
            this.setState({
                isSelectedPaymentMethodDefault: isDefault,
                shouldShowDefaultDeleteMenu: true,
                selectedPaymentMethod: account,
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
                methodID,
            });
            this.setPositionAddPaymentMenu(position);
            return;
        }
        this.setState({
            shouldShowAddPaymentMenu: true,
        });

        this.setPositionAddPaymentMenu(position);
    }

    /**
     * Navigate to the appropriate payment type addition screen
     *
     * @param {String} paymentType
     */
    addPaymentMethodTypePressed(paymentType) {
        this.hideAddPaymentMenu();

        if (paymentType === CONST.PAYMENT_METHODS.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
            return;
        }

        throw new Error('Invalid payment method type selected');
    }

    fetchData() {
        PaymentMethods.openPaymentsPage();
    }

    /**
     * Hide the add payment modal
     */
    hideAddPaymentMenu() {
        this.setState({shouldShowAddPaymentMenu: false});
    }

    /**
     * Hide the default / delete modal
     */
    hideDefaultDeleteMenu() {
        this.setState({shouldShowDefaultDeleteMenu: false});
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                showConfirmDeleteContent: false,
            });
        });
    }

    hidePasswordPrompt() {
        this.setState({shouldShowPasswordPrompt: false});

        // Due to iOS modal freeze issue, password modal freezes the app when closed.
        // LayoutAnimation undoes the running animation.
        LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
    }

    makeDefaultPaymentMethod(password) {
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = PaymentUtils.formatPaymentMethods(
            this.props.bankAccountList,
            this.props.cardList,
        );

        const previousPaymentMethod = _.find(paymentMethods, method => method.isDefault);
        const currentPaymentMethod = _.find(paymentMethods, method => method.methodID === this.state.methodID);
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            PaymentMethods.makeDefaultPaymentMethod(password, this.state.selectedPaymentMethod.bankAccountID, null, previousPaymentMethod, currentPaymentMethod);
        } else if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.makeDefaultPaymentMethod(password, null, this.state.selectedPaymentMethod.fundID, previousPaymentMethod, currentPaymentMethod);
        }
    }

    deletePaymentMethod() {
        if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            PaymentMethods.deletePayPalMe();
        } else if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            BankAccounts.deletePaymentBankAccount(this.state.selectedPaymentMethod.bankAccountID);
        } else if (this.state.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.deletePaymentCard(this.state.selectedPaymentMethod.fundID);
        }
    }

    navigateToTransferBalancePage() {
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_TRANSFER_BALANCE);
    }

    listHeaderComponent() {
        return (
            <>
                {Permissions.canUseWallet(this.props.betas) && (
                    <>
                        <View style={[styles.mv5]}>
                            {this.state.shouldShowLoadingSpinner ? (
                                <ActivityIndicator color={themeColors.spinner} size="large" />
                            ) : (
                                <OfflineWithFeedback
                                    pendingAction={CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}
                                    errors={this.props.walletTerms.errors}
                                    onClose={PaymentMethods.clearWalletTermsError}
                                    errorRowStyles={[styles.ml10, styles.mr2]}
                                >
                                    <CurrentWalletBalance />
                                </OfflineWithFeedback>
                            )}
                        </View>
                        {this.props.userWallet.currentBalance > 0 && (
                            <KYCWall
                                onSuccessfulKYC={this.navigateToTransferBalancePage}
                                enablePaymentsRoute={ROUTES.SETTINGS_ENABLE_PAYMENTS}
                                addBankAccountRoute={ROUTES.SETTINGS_ADD_BANK_ACCOUNT}
                                addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                popoverPlacement="bottom"
                            >
                                {triggerKYCFlow => (
                                    <MenuItem
                                        title={this.props.translate('common.transferBalance')}
                                        icon={Expensicons.Transfer}
                                        onPress={triggerKYCFlow}
                                        shouldShowRightIcon
                                        disabled={this.props.network.isOffline}
                                    />
                                )}
                            </KYCWall>
                        )}
                    </>
                )}
                <Text
                    style={[styles.ph5, styles.mt6, styles.formLabel]}
                >
                    {this.props.translate('paymentsPage.paymentMethodsTitle')}
                </Text>
            </>
        );
    }

    render() {
        const isPayPalMeSelected = this.state.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.PAYPAL;
        const shouldShowMakeDefaultButton = !this.state.isSelectedPaymentMethodDefault
            && Permissions.canUseWallet(this.props.betas)
            && !isPayPalMeSelected
            && !(this.state.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.BANK_ACCOUNT && this.state.selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS);

        // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
        const isPopoverBottomMount = this.state.anchorPositionTop === 0 || this.props.isSmallScreenWidth;
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.payments')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.flex1, styles.mb4]}>
                    <OfflineWithFeedback
                        style={styles.flex1}
                        contentContainerStyle={styles.flex1}
                        onClose={() => PaymentMethods.clearWalletError()}
                        errors={this.props.userWallet.errors}
                        errorRowStyles={[styles.ph6]}
                    >
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                            style={[styles.flex4]}
                            isAddPaymentMenuActive={this.state.shouldShowAddPaymentMenu}
                            actionPaymentMethodType={this.state.shouldShowDefaultDeleteMenu || this.state.shouldShowPasswordPrompt
                                ? this.state.selectedPaymentMethodType
                                : ''}
                            activePaymentMethodID={this.state.shouldShowDefaultDeleteMenu || this.state.shouldShowPasswordPrompt
                                ? this.getSelectedPaymentMethodID()
                                : ''}
                            listHeaderComponent={this.listHeaderComponent}
                        />
                    </OfflineWithFeedback>
                </View>
                <AddPaymentMethodMenu
                    isVisible={this.state.shouldShowAddPaymentMenu}
                    onClose={this.hideAddPaymentMenu}
                    anchorPosition={{
                        bottom: this.state.anchorPositionBottom,
                        right: this.state.anchorPositionRight - 10,
                    }}
                    onItemSelected={method => this.addPaymentMethodTypePressed(method)}
                />
                <Popover
                    isVisible={this.state.shouldShowDefaultDeleteMenu}
                    onClose={this.hideDefaultDeleteMenu}
                    anchorPosition={{
                        top: this.state.anchorPositionTop,
                        right: this.state.anchorPositionRight,
                    }}
                >
                    {!this.state.showConfirmDeleteContent ? (
                        <View
                            style={[
                                styles.m5,
                                !this.props.isSmallScreenWidth ? styles.sidebarPopover : '',
                            ]}
                        >
                            {isPopoverBottomMount && (
                            <MenuItem
                                title={this.state.formattedSelectedPaymentMethod.title || ''}
                                icon={this.state.formattedSelectedPaymentMethod.icon}
                                description={this.state.formattedSelectedPaymentMethod.description}
                                wrapperStyle={[styles.pv0, styles.ph0, styles.mb4]}
                                disabled
                                interactive={false}
                            />
                            )}
                            {shouldShowMakeDefaultButton && (
                            <Button
                                onPress={() => {
                                    this.setState({
                                        shouldShowDefaultDeleteMenu: false,
                                    });

                                    // Wait for the previous modal to close, before opening a new one. A modal will be considered completely closed when closing animation is finished.
                                    // InteractionManager fires after the currently running animation is completed.
                                    // https://github.com/Expensify/App/issues/7768#issuecomment-1044879541
                                    InteractionManager.runAfterInteractions(() => {
                                        this.setState({
                                            shouldShowPasswordPrompt: true,
                                            passwordButtonText: this.props.translate('paymentsPage.setDefaultConfirmation'),
                                        });
                                    });
                                }}
                                text={this.props.translate('paymentsPage.setDefaultConfirmation')}
                            />
                            )}
                            <Button
                                onPress={() => {
                                    this.setState({
                                        showConfirmDeleteContent: true,
                                    });
                                }}
                                style={[shouldShowMakeDefaultButton && styles.mt4]}
                                text={this.props.translate('common.delete')}
                                danger
                            />
                        </View>
                    ) : (
                        <ConfirmContent
                            onConfirm={() => {
                                this.setState({
                                    shouldShowDefaultDeleteMenu: false,
                                });
                                InteractionManager.runAfterInteractions(() => {
                                    this.setState({
                                        showConfirmDeleteContent: false,
                                    });
                                });
                                this.deletePaymentMethod();
                            }}
                            onCancel={() => {
                                this.setState({
                                    shouldShowDefaultDeleteMenu: false,
                                });
                                InteractionManager.runAfterInteractions(
                                    () => {
                                        this.setState(
                                            {
                                                showConfirmDeleteContent: false,
                                            },
                                        );
                                    },
                                );
                            }}
                            contentStyles={!this.props.isSmallScreenWidth ? [styles.sidebarPopover] : undefined}
                            title={this.props.translate('paymentsPage.deleteAccount')}
                            prompt={this.props.translate('paymentsPage.deleteConfirmation')}
                            confirmText={this.props.translate('common.delete')}
                            cancelText={this.props.translate('common.cancel')}
                            anchorPosition={{
                                top: this.state.anchorPositionTop,
                                right: this.state.anchorPositionRight,
                            }}
                            shouldShowCancelButton
                            danger
                        />
                    )}
                </Popover>
                <PasswordPopover
                    isVisible={this.state.shouldShowPasswordPrompt}
                    onClose={this.hidePasswordPrompt}
                    anchorPosition={{
                        top: this.state.anchorPositionTop,
                        right: this.state.anchorPositionRight,
                    }}
                    onSubmit={(password) => {
                        this.hidePasswordPrompt();
                        this.makeDefaultPaymentMethod(password);
                    }}
                    submitButtonText={this.state.passwordButtonText}
                    isDangerousAction
                />
            </ScreenWrapper>
        );
    }
}

BasePaymentsPage.propTypes = propTypes;
BasePaymentsPage.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withNetwork(),
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
        cardList: {
            key: ONYXKEYS.CARD_LIST,
        },
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
        },
    }),
)(BasePaymentsPage);
