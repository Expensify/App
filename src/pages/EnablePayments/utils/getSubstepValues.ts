import type {OnyxEntry} from 'react-native-onyx';
import type {WalletAdditionalDetailsForm} from '@src/types/form';
import type {PersonalInfoStepProps} from '@src/types/form/WalletAdditionalDetailsForm';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

function getSubstepValues<T extends keyof WalletAdditionalDetailsForm>(
    inputKeys: Record<string, T>,
    walletAdditionalDetailsDraft: OnyxEntry<WalletAdditionalDetailsForm>,
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>,
): {[K in T]: WalletAdditionalDetailsForm[K]} {
    return Object.entries(inputKeys).reduce(
        (acc, [, value]) => ({
            ...acc,
            [value]: walletAdditionalDetailsDraft?.[value] ?? walletAdditionalDetails?.[value as keyof PersonalInfoStepProps] ?? '',
        }),
        {} as {[K in T]: WalletAdditionalDetailsForm[K]},
    );
}

export default getSubstepValues;
