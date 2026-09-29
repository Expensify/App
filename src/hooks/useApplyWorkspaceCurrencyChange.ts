import Navigation from '@libs/Navigation/Navigation';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';

import {clearCorpayBankAccountFields} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import {setWorkspaceDistanceAutoUpdate} from '@userActions/Policy/DistanceRate';
import {updateGeneralSettings} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';
import useReviewWorkspaceSettingsTaskCompletion from './useReviewWorkspaceSettingsTaskCompletion';

type ApplyWorkspaceCurrencyChangeOptions = {
    /** Whether the currency change is forced by the global reimbursement setup, which continues to bank account connection */
    isForcedToChangeCurrency?: boolean;
    /** Country whose government mileage rates should auto-update, needed when several countries share the new currency */
    governmentRateCountry?: string;
    /** Where to go back to after the change, when the caller sits deeper than one screen in the stack */
    backTo?: Route;
};

/**
 * Returns a function that applies a workspace currency change: clears bank account drafts, writes the new currency,
 * and re-enables government rate auto-update when a country was chosen for a shared (EUR) currency.
 */
function useApplyWorkspaceCurrencyChange(policy: OnyxEntry<Policy>) {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [governmentMileageRates] = useOnyx(ONYXKEYS.GOVERNMENT_MILEAGE_RATES);
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();

    return (currencyCode: string, {isForcedToChangeCurrency = false, governmentRateCountry, backTo}: ApplyWorkspaceCurrencyChangeOptions = {}) => {
        if (!policy) {
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        updateGeneralSettings(policy, policy.name ?? '', currencyCode, getReviewWorkspaceSettingsTaskCompletion());
        clearCorpayBankAccountFields();

        // The server turns auto-update off when the currency becomes EUR, so re-enable it with the chosen country right after
        if (governmentRateCountry) {
            setWorkspaceDistanceAutoUpdate(policy.id, getDistanceRateCustomUnit(policy), true, governmentMileageRates ?? [], currencyCode, governmentRateCountry);
        }

        // The currency list is a plain string, so widen the supported tuple before the membership check
        const isSupportedForGlobalReimbursement = (CONST.DIRECT_REIMBURSEMENT_CURRENCIES as readonly string[]).includes(currencyCode);
        if (isForcedToChangeCurrency && isSupportedForGlobalReimbursement) {
            const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, currencyCode, true).length > 0;
            if (hasValidExistingAccounts) {
                Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policy.id, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id)));
                return;
            }
            navigateToBankAccountRoute({
                policyID: policy.id,
                backTo: ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy.id),
                navigationOptions: {forceReplace: true},
            });
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(backTo));
    };
}

export default useApplyWorkspaceCurrencyChange;
