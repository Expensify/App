import {subYears} from 'date-fns';
import React, {useCallback, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS, {type DateOfBirthForm} from '@src/types/form/DateOfBirthForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';

type DateOfBirthPageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    /** Whether app is loading */
    isLoadingApp: OnyxEntry<boolean>;
};
type DateOfBirthPageProps = DateOfBirthPageOnyxProps;

function DateOfBirthPage({privatePersonalDetails, isLoadingApp = true}: DateOfBirthPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});

    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    /**
     * @returns An object containing the errors for each inputID
     */
    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM>) => {
        const requiredFields = ['dob' as const];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

        const minimumAge = CONST.DATE_BIRTH.MIN_AGE;
        const maximumAge = CONST.DATE_BIRTH.MAX_AGE;
        const dateError = ValidationUtils.getAgeRequirementError(values.dob ?? '', minimumAge, maximumAge);

        if (values.dob && dateError) {
            errors.dob = dateError;
        }

        return errors;
    }, []);

    // For delegates, modifying legal DOB is a restricted action.
    // So, on pressing submit, skip validation and show delegateNoAccessModal
    const skipValidation = isActingAsDelegate;
    const handleSubmit = (DOB: DateOfBirthForm) => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        PersonalDetails.updateDateOfBirth(DOB);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={DateOfBirthPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.dob')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {isLoadingApp ? (
                <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}
                    validate={skipValidation ? undefined : validate}
                    onSubmit={handleSubmit}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.DOB}
                        label={translate('common.date')}
                        defaultValue={privatePersonalDetails?.dob ?? ''}
                        minDate={subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE)}
                        maxDate={subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE)}
                    />
                </FormProvider>
            )}
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </ScreenWrapper>
    );
}

DateOfBirthPage.displayName = 'DateOfBirthPage';

export default withOnyx<DateOfBirthPageProps, DateOfBirthPageOnyxProps>({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(DateOfBirthPage);
