import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {isPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasActiveAdminWorkspaces} from '@libs/PolicyUtils';

import {getFirstPageName} from '@pages/settings/Wallet/UpdatePersonalBankAccountPage';

import {openPersonalBankAccountSetupView, resetPersonalBankAccountForUpdate} from '@userActions/BankAccounts';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';

import ROUTES from '@src/ROUTES';
import type {BankAccountList, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import type {PaymentMethodPressHandlerParams} from './types';

import {getPersonalBankAccountUpdateDrafts, shouldOpenBankAccountByPolicy} from './utils';

/**
 * Row-press handlers for the bank accounts list: opening an existing account (or finishing its setup) and adding a new one.
 */
function useBankAccountRowPress(bankAccountList: BankAccountList, allPolicies: OnyxCollection<Policy>) {
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    const onBankAccountRowPress = ({accountData}: PaymentMethodPressHandlerParams) => {
        if (isPersonalBankAccountMissingInfo(accountData) && accountData?.bankAccountID) {
            const {personalBankAccountDraft, homeAddressDraft} = getPersonalBankAccountUpdateDrafts(accountData.additionalData);
            resetPersonalBankAccountForUpdate(accountData.bankAccountID, personalBankAccountDraft, homeAddressDraft);
            Navigation.navigate(ROUTES.SETTINGS_UPDATE_PERSONAL_BANK_ACCOUNT.getRoute(getFirstPageName(bankAccountList, accountData.bankAccountID)));
            return;
        }

        const accountPolicyID = accountData?.additionalData?.policyID;
        const bankAccountID = accountData?.bankAccountID;

        if (accountPolicyID && isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (accountPolicyID && shouldOpenBankAccountByPolicy(accountData, allPolicies, currentUserLogin)) {
            navigateToBankAccountRoute({policyID: accountPolicyID, backTo: ROUTES.SETTINGS_WALLET});
            return;
        }
        navigateToBankAccountRoute({bankAccountID, backTo: ROUTES.SETTINGS_WALLET});
    };

    const onAddBankAccountPress = () => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (hasActiveAdminWorkspaces(currentUserLogin, allPolicies)) {
            Navigation.navigate(ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
            return;
        }
        openPersonalBankAccountSetupView({});
    };

    return {onBankAccountRowPress, onAddBankAccountPress};
}

export default useBankAccountRowPress;
