import type {OnyxEntry} from 'react-native-onyx';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {ACHData, Corpay} from '@src/types/onyx/ReimbursementAccount';

type SubStepValues<TProps extends keyof ReimbursementAccountForm> = {
    [TKey in TProps]: ReimbursementAccountForm[TKey];
};

/** Some values are send under certain key and saved under different key by BE.
 * This is forced on BE side which is asking us to send it under certain keys but then saves it and returns under different keys.
 * This is why we need a separate util just for this step, so we can correctly gather default values for such cases */
function getBankInfoStepValues<TProps extends keyof ReimbursementAccountForm>(
    inputKeys: Record<string, TProps>,
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>,
    reimbursementAccount: OnyxEntry<ReimbursementAccount>,
): SubStepValues<TProps> {
    return Object.entries(inputKeys).reduce((acc, [, value]) => {
        switch (value) {
            case INPUT_IDS.ADDITIONAL_DATA.ROUTING_CODE:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[INPUT_IDS.BANK_INFO_STEP.ROUTING_NUMBER as keyof ACHData] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
            case INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[INPUT_IDS.BANK_INFO_STEP.ROUTING_NUMBER as keyof ACHData] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
            case INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_NAME:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.ADDRESS_NAME as keyof ACHData] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
            case INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_ADDRESS_1:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.ADDRESS_STREET as keyof ACHData] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
            case INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_CITY:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.ADDRESS_CITY as keyof ACHData] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
            case INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_REGION:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.ADDRESS_STATE as keyof ACHData] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
            case INPUT_IDS.ADDITIONAL_DATA.ACCOUNT_HOLDER_POSTAL:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.ADDRESS_ZIP_CODE as keyof ACHData] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
            default:
                acc[value] = (reimbursementAccountDraft?.[value] ??
                    reimbursementAccount?.achData?.[value as keyof ACHData] ??
                    reimbursementAccount?.achData?.corpay?.[value as keyof Corpay] ??
                    '') as ReimbursementAccountForm[TProps];
                break;
        }
        return acc;
    }, {} as SubStepValues<TProps>);
}

export {getBankInfoStepValues};
export type {SubStepValues};
