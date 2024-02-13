import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import type {ACHData} from '@src/types/onyx/ReimbursementAccount';

function getSubstepValues<T extends keyof ReimbursementAccountDraft>(
    inputKeys: Record<string, T>,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>,
    reimbursementAccount: OnyxEntry<ReimbursementAccount>,
): {[K in T]: ReimbursementAccountDraft[K]} {
    return Object.entries(inputKeys).reduce(
        (acc, [, value]) => ({
            ...acc,
            [value]: reimbursementAccountDraft?.[value] ?? reimbursementAccount?.achData?.[value as keyof ACHData] ?? '',
        }),
        {} as {[K in T]: ReimbursementAccountDraft[K]},
    );
}

export default getSubstepValues;
