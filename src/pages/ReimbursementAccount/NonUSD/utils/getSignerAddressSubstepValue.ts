import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {ACHData} from '@src/types/onyx/ReimbursementAccount';

type SubstepValues<TProps extends keyof ReimbursementAccountForm> = {
    [TKey in TProps]: ReimbursementAccountForm[TKey];
};

const hasDraftSignerAddress = (inputKeys: Record<string, string>, isSecondSigner: boolean, reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>) => {
    const prefix = isSecondSigner ? inputKeys.SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS : inputKeys.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS;

    return (
        reimbursementAccountDraft?.[`${prefix}_street`] !== '' &&
        reimbursementAccountDraft?.[`${prefix}_state`] !== '' &&
        reimbursementAccountDraft?.[`${prefix}_city`] !== '' &&
        reimbursementAccountDraft?.[`${prefix}_zipCode`] !== ''
    );
};
const getSignerAddressSubstepValue = (
    inputKeys: Record<string, string>,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
    reimbursementAccount: OnyxEntry<ReimbursementAccount>,
    isSecondSigner: boolean,
): string => {
    const prefix = isSecondSigner ? inputKeys.SECOND_SIGNER_COMPLETE_RESIDENTIAL_ADDRESS : inputKeys.SIGNER_COMPLETE_RESIDENTIAL_ADDRESS;

    return hasDraftSignerAddress(inputKeys, isSecondSigner, reimbursementAccountDraft)
        ? `${reimbursementAccountDraft?.[`${prefix}_street`]}, ${reimbursementAccountDraft?.[`${prefix}_city`]}, ${reimbursementAccountDraft?.[`${prefix}_state`]}, ${
              reimbursementAccountDraft?.[`${prefix}_zipCode`]
          }`
        : (reimbursementAccount?.achData?.[prefix as keyof ACHData] as string);
};

export default getSignerAddressSubstepValue;
