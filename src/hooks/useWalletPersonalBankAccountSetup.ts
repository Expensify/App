/**
 * Reads the Onyx state needed to open or resume a Wallet-initiated personal bank account setup
 * and reports whether that state is still loading.
 */
import ONYXKEYS from '@src/ONYXKEYS';
import type {InternationalBankAccountForm, PersonalBankAccountForm} from '@src/types/form';
import type {PersonalBankAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

const personalBankAccountSourceSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.source;
const personalBankAccountShouldShowSuccessSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.shouldShowSuccess;
const personalBankAccountCurrentPageSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.currentPage;
const personalDraftSetupTypeSelector = (personalDraft: OnyxEntry<PersonalBankAccountForm>) => personalDraft?.setupType;
const internationalDraftBankCountrySelector = (internationalDraft: OnyxEntry<InternationalBankAccountForm>) => internationalDraft?.bankCountry;

function useWalletPersonalBankAccountSetup() {
    const [source, personalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountSourceSelector});
    const [shouldShowSuccess] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountShouldShowSuccessSelector});
    const [currentPage] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountCurrentPageSelector});
    const [setupType, personalDraftMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {selector: personalDraftSetupTypeSelector});
    const [bankCountry, internationalDraftMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, {selector: internationalDraftBankCountrySelector});

    const isLoading = isLoadingOnyxValue(personalBankAccountMetadata, personalDraftMetadata, internationalDraftMetadata);
    const personalBankAccount = {source, shouldShowSuccess, currentPage};
    const personalDraft = {setupType};
    const internationalDraft = bankCountry ? {bankCountry} : undefined;

    return {personalBankAccount, personalDraft, internationalDraft, isLoading};
}

export default useWalletPersonalBankAccountSetup;
