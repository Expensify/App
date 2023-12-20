import type {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import getDefaultValueForReimbursementAccountField from './getDefaultValueForReimbursementAccountField';

function getSubstepValues<T extends keyof ReimbursementAccountDraft>(
    inputKeys: Record<string, T>,
    reimbursementAccountDraft: ReimbursementAccountDraft,
    reimbursementAccount: ReimbursementAccount,
): Record<T, ReimbursementAccountDraft[T]> {
    return Object.entries(inputKeys).reduce(
        (acc, [, value]) => ({
            ...acc,
            [value]: reimbursementAccountDraft[value] ?? getDefaultValueForReimbursementAccountField(reimbursementAccount, value, ''),
        }),
        {} as Record<T, ReimbursementAccountDraft[T]>,
    );
}

export default getSubstepValues;
