import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {ACHData} from '@src/types/onyx/ReimbursementAccount';

type SubstepValues<TProps extends keyof ReimbursementAccountForm> = {
    [TKey in TProps]: ReimbursementAccountForm[TKey];
};

function getSubstepValues<TProps extends keyof ReimbursementAccountForm>(
    inputKeys: Record<string, TProps>,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
    reimbursementAccount: OnyxEntry<ReimbursementAccount>,
): SubstepValues<TProps> {
    return Object.entries(inputKeys).reduce((acc, [, value]) => {
        acc[value] = (reimbursementAccountDraft?.[value] ?? reimbursementAccount?.achData?.[value as keyof ACHData] ?? '') as ReimbursementAccountForm[TProps];
        return acc;
    }, {} as SubstepValues<TProps>);
}

export default getSubstepValues;
