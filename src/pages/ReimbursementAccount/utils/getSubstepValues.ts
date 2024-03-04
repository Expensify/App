import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {ACHData} from '@src/types/onyx/ReimbursementAccount';

function getSubstepValues<T extends keyof ReimbursementAccountForm>(
    inputKeys: Record<string, T>,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
    reimbursementAccount: OnyxEntry<ReimbursementAccount>,
): {[K in T]: ReimbursementAccountForm[K]} {
    return Object.entries(inputKeys).reduce(
        (acc, [, value]) => ({
            ...acc,
            [value]: reimbursementAccountDraft?.[value] ?? reimbursementAccount?.achData?.[value as keyof ACHData] ?? '',
        }),
        {} as {[K in T]: ReimbursementAccountForm[K]},
    );
}

export default getSubstepValues;
