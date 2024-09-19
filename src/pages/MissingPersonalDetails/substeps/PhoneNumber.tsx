import React from 'react';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

function PhoneNumberStep({privatePersonalDetails}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('privatePersonalDetails.enterPhoneNumber')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.PHONE_NUMBER}
                label={translate('common.phoneNumber')}
                aria-label={translate('common.phoneNumber')}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.TEL}
                defaultValue={privatePersonalDetails?.phoneNumber}
                containerStyles={[styles.mt6]}
            />
        </>
    );
}

PhoneNumberStep.displayName = 'PhoneNumberStep';

export default PhoneNumberStep;
