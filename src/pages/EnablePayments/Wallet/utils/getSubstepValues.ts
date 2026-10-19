import type {WalletAdditionalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import type {PersonalInfoStepProps} from '@src/types/form/WalletAdditionalDetailsForm';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

import type {OnyxEntry} from 'react-native-onyx';

function getSubstepValues(walletAdditionalDetailsDraft: OnyxEntry<WalletAdditionalDetailsForm>, walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>): PersonalInfoStepProps {
    const inputKeys = INPUT_IDS.PERSONAL_INFO_STEP;
    const getValueFor = (key: keyof PersonalInfoStepProps) => walletAdditionalDetailsDraft?.[key] ?? walletAdditionalDetails?.[key] ?? '';

    return {
        [inputKeys.FIRST_NAME]: getValueFor(inputKeys.FIRST_NAME),
        [inputKeys.LAST_NAME]: getValueFor(inputKeys.LAST_NAME),
        [inputKeys.DOB]: getValueFor(inputKeys.DOB),
        [inputKeys.SSN_LAST_4]: getValueFor(inputKeys.SSN_LAST_4),
        [inputKeys.STREET]: getValueFor(inputKeys.STREET),
        [inputKeys.CITY]: getValueFor(inputKeys.CITY),
        [inputKeys.STATE]: getValueFor(inputKeys.STATE),
        [inputKeys.ZIP_CODE]: getValueFor(inputKeys.ZIP_CODE),
        [inputKeys.PHONE_NUMBER]: getValueFor(inputKeys.PHONE_NUMBER),
    };
}

export default getSubstepValues;
