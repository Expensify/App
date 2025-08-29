import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
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
            (value === INPUT_IDS.ADDITIONAL_DATA.CORPAY.ACH_AUTHORIZATION_FORM ? [] : '')) as ReimbursementAccountForm[TProps];
        return acc;
    }, {} as SubStepValues<TProps>);
}

export default getSubStepValues;
