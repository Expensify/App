import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {ACHData, Corpay} from '@src/types/onyx/ReimbursementAccount';

type SubStepValues<TProps extends keyof ReimbursementAccountForm> = {
    [TKey in TProps]: ReimbursementAccountForm[TKey];
};

function getSubStepValues<TProps extends keyof ReimbursementAccountForm>(
    inputKeys: Record<string, TProps>,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
    reimbursementAccount: OnyxEntry<ReimbursementAccount>,
): SubStepValues<TProps> {
    return Object.entries(inputKeys).reduce((acc, [, value]) => {
        acc[value] = (reimbursementAccountDraft?.[value] ??
            reimbursementAccount?.achData?.[value as keyof ACHData] ??
            reimbursementAccount?.achData?.corpay?.[value as keyof Corpay] ??
            (value === 'achAuthorizationForm' ? [] : '')) as ReimbursementAccountForm[TProps];
        return acc;
    }, {} as SubStepValues<TProps>);
}

export default getSubStepValues;
