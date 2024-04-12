import type {OnyxEntry} from 'react-native-onyx';
import type {PersonalBankAccountForm} from '@src/types/form';
import type {WalletAdditionalDetails} from '@src/types/onyx';

function getSubstepValues<T extends keyof PersonalBankAccountForm>(
    inputKeys: Record<string, T>,
    walletAdditionalDetailsDraft: OnyxEntry<PersonalBankAccountForm>,
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetails>,
): {[K in T]: PersonalBankAccountForm[K]} {
    return Object.entries(inputKeys).reduce(
        (acc, [, value]) => ({
            ...acc,
            [value]: walletAdditionalDetailsDraft?.[value] ?? walletAdditionalDetails?.[value] ?? '',
        }),
        {} as {[K in T]: PersonalBankAccountForm[K]},
    );
}

export default getSubstepValues;
