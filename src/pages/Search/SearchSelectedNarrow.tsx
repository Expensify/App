import isEmpty from 'lodash/isEmpty';
import React, {useContext, useRef} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import KYCWall from '@components/KYCWall';
import type {PaymentMethod, PaymentMethodType} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {BankAccountMenuItem} from '@components/Search/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidBulkPayOption} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getActiveAdminWorkspaces} from '@libs/PolicyUtils';
import {isExpenseReport} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;

type TriggerKYCFlow = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, paymentMethod?: PaymentMethod, policy?: Policy) => void;

type SearchSelectedNarrowProps = {
    options: Array<DropdownOption<SearchHeaderOptionValue>>;
    itemsLength: number;
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    confirmPayment?: (paymentType: PaymentMethodType | undefined) => void;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

function SearchSelectedNarrow({options, itemsLength, currentSelectedPolicyID, currentSelectedReportID, confirmPayment, latestBankItems}: SearchSelectedNarrowProps) {
    const styles = useThemeStyles();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {translate} = useLocalize();
    const currentPolicy = usePolicy(currentSelectedPolicyID);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    // Stores an option to execute after modal closes when using deferred execution
    const selectedOptionRef = useRef<DropdownOption<SearchHeaderOptionValue> | null>(null);
    const {accountID} = useCurrentUserPersonalDetails();
    const activeAdminPolicies = getActiveAdminWorkspaces(allPolicies, accountID.toString()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const handleOnMenuItemPress = (option: DropdownOption<SearchHeaderOptionValue>) => {
        if (option?.shouldCloseModalOnSelect) {
            selectedOptionRef.current = option;
            return;
        }
        option?.onSelected?.();
    };

    const checkRestrictUserBillingAction = () => {
        const shouldRestrictUserAction = currentPolicy && shouldRestrictUserBillableActions(currentPolicy.id);
        if (shouldRestrictUserAction) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(currentPolicy?.id));
        }
        return shouldRestrictUserAction;
    };
    const handleSubItemSelected = (item: PopoverMenuItem, triggerKYCFlow: TriggerKYCFlow) => {
        if (!isValidBulkPayOption(item)) {
            return;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        const shouldRestrictUser = checkRestrictUserBillingAction();

        if (shouldRestrictUser) {
            return;
        }

        const isPaymentMethod = Object.values(CONST.PAYMENT_METHODS).includes(item.key as PaymentMethod);
        const shouldSelectPaymentMethod = isPaymentMethod || !isEmpty(latestBankItems);
        const selectedPolicy = activeAdminPolicies.find((activePolicy) => activePolicy.id === item.key);

        const paymentMethod = item.key as PaymentMethod;
        let paymentType;
        switch (paymentMethod) {
            case CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT:
                paymentType = CONST.IOU.PAYMENT_TYPE.EXPENSIFY;
                break;
            case CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT:
                paymentType = CONST.IOU.PAYMENT_TYPE.VBBA;
                break;
            default:
                paymentType = CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
                break;
        }

        if (!!selectedPolicy || shouldSelectPaymentMethod) {
            if (!isUserValidated) {
                Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
                return;
            }
            triggerKYCFlow(undefined, paymentType, paymentMethod, selectedPolicy);

            if (paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
            }
            return;
        }
        confirmPayment?.(paymentType as PaymentMethodType);
    };

    return (
        <KYCWall
            chatReportID={currentSelectedReportID}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            addBankAccountRoute={isCurrentSelectedExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(currentSelectedPolicyID, undefined, Navigation.getActiveRoute()) : undefined}
            onSuccessfulKYC={(paymentType) => confirmPayment?.(paymentType)}
        >
            {(triggerKYCFlow, buttonRef) => (
                <View style={[styles.pb3]}>
                    <ButtonWithDropdownMenu
                        buttonRef={buttonRef}
                        options={options}
                        customText={translate('workspace.common.selected', {count: itemsLength})}
                        shouldAlwaysShowDropdownMenu
                        isDisabled={options.length === 0}
                        onPress={() => null}
                        onOptionSelected={(item) => handleOnMenuItemPress(item)}
                        onSubItemSelected={(subMenuItem) => handleSubItemSelected(subMenuItem, triggerKYCFlow)}
                        success
                        isSplitButton={false}
                        style={[styles.w100, styles.ph5]}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        }}
                        shouldUseModalPaddingStyle
                    />
                </View>
            )}
        </KYCWall>
    );
}

SearchSelectedNarrow.displayName = 'SearchSelectedNarrow';

export default SearchSelectedNarrow;
