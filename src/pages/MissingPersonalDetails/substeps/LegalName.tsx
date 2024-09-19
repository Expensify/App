import React from 'react';
import {View} from 'react-native';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

function LegalNameStep({privatePersonalDetails}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterLegalName')}</Text>
            <View style={[styles.flex2, styles.mb6]}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                    name="lfname"
                    label={translate('privatePersonalDetails.legalFirstName')}
                    aria-label={translate('privatePersonalDetails.legalFirstName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={privatePersonalDetails?.legalFirstName}
                    spellCheck={false}
                />
            </View>
            <View style={[styles.flex2, styles.mb6]}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.LEGAL_LAST_NAME}
                    name="llname"
                    label={translate('privatePersonalDetails.legalLastName')}
                    aria-label={translate('privatePersonalDetails.legalLastName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={privatePersonalDetails?.legalLastName}
                    spellCheck={false}
                />
            </View>
        </>
    );
}

LegalNameStep.displayName = 'LegalNameStep';

export default LegalNameStep;
