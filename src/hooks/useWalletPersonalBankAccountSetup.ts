/**
 * Reads the Onyx state needed to open or resume a Wallet-initiated personal bank account setup
 * and reports whether that state is still loading.
 */
import ONYXKEYS from '@src/ONYXKEYS';
import type {InternationalBankAccountForm} from '@src/types/form';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';
import usePersonalBankAccountSetup from './usePersonalBankAccountSetup';

const internationalDraftBankCountrySelector = (internationalDraft: OnyxEntry<InternationalBankAccountForm>) => internationalDraft?.bankCountry;

function useWalletPersonalBankAccountSetup() {
    const personalBankAccountSetup = usePersonalBankAccountSetup();
    const [bankCountry, internationalDraftMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, {selector: internationalDraftBankCountrySelector});

    const isLoading = personalBankAccountSetup.isLoading || isLoadingOnyxValue(internationalDraftMetadata);
    const internationalDraft = bankCountry ? {bankCountry} : undefined;

    return {...personalBankAccountSetup, internationalDraft, isLoading};
}

export default useWalletPersonalBankAccountSetup;
