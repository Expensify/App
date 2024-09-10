import {subYears} from 'date-fns';
import React from 'react';
import DatePicker from '@components/DatePicker';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

function DateOfBirthStep({privatePersonalDetails}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE);

    return (
        <>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterDateOfBirth')}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={INPUT_IDS.DATE_OF_BIRTH}
                label={translate('common.dob')}
                placeholder={translate('common.dateFormat')}
                defaultValue={privatePersonalDetails?.dob}
                minDate={minDate}
                maxDate={maxDate}
            />
        </>
    );
}

DateOfBirthStep.displayName = 'DateOfBirthStep';

export default DateOfBirthStep;
