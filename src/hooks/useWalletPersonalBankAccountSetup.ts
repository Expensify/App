import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function useWalletPersonalBankAccountSetup() {
    const [personalBankAccount, personalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [personalDraft, personalDraftMetadata] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [internationalDraft, internationalDraftMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [, plaidDataMetadata] = useOnyx(ONYXKEYS.PLAID_DATA);

    const isLoading = isLoadingOnyxValue(personalBankAccountMetadata, personalDraftMetadata, internationalDraftMetadata, plaidDataMetadata);

    return {personalBankAccount, personalDraft, internationalDraft, isLoading};
}

export default useWalletPersonalBankAccountSetup;
