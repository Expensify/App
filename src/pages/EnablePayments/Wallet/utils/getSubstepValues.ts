import type {WalletAdditionalDetailsForm} from '@src/types/form';
import type INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import type {PersonalInfoStepProps} from '@src/types/form/WalletAdditionalDetailsForm';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

import type {OnyxEntry} from 'react-native-onyx';

function getSubstepValues(
    inputKeys: typeof INPUT_IDS.PERSONAL_INFO_STEP,
    walletAdditionalDetailsDraft: OnyxEntry<WalletAdditionalDetailsForm>,
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>,
): PersonalInfoStepProps {
    return {
        [inputKeys.FIRST_NAME]: walletAdditionalDetailsDraft?.[inputKeys.FIRST_NAME] ?? walletAdditionalDetails?.[inputKeys.FIRST_NAME] ?? '',
        [inputKeys.LAST_NAME]: walletAdditionalDetailsDraft?.[inputKeys.LAST_NAME] ?? walletAdditionalDetails?.[inputKeys.LAST_NAME] ?? '',
        [inputKeys.DOB]: walletAdditionalDetailsDraft?.[inputKeys.DOB] ?? walletAdditionalDetails?.[inputKeys.DOB] ?? '',
        [inputKeys.SSN_LAST_4]: walletAdditionalDetailsDraft?.[inputKeys.SSN_LAST_4] ?? walletAdditionalDetails?.[inputKeys.SSN_LAST_4] ?? '',
        [inputKeys.STREET]: walletAdditionalDetailsDraft?.[inputKeys.STREET] ?? walletAdditionalDetails?.[inputKeys.STREET] ?? '',
        [inputKeys.CITY]: walletAdditionalDetailsDraft?.[inputKeys.CITY] ?? walletAdditionalDetails?.[inputKeys.CITY] ?? '',
        [inputKeys.STATE]: walletAdditionalDetailsDraft?.[inputKeys.STATE] ?? walletAdditionalDetails?.[inputKeys.STATE] ?? '',
        [inputKeys.ZIP_CODE]: walletAdditionalDetailsDraft?.[inputKeys.ZIP_CODE] ?? walletAdditionalDetails?.[inputKeys.ZIP_CODE] ?? '',
        [inputKeys.PHONE_NUMBER]: walletAdditionalDetailsDraft?.[inputKeys.PHONE_NUMBER] ?? walletAdditionalDetails?.[inputKeys.PHONE_NUMBER] ?? '',
    };
}

export default getSubstepValues;
