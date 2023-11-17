import {subYears} from 'date-fns';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NewDatePicker from '@components/NewDatePicker';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /* Onyx Props */

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        dob: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    privatePersonalDetails: {
        dob: '',
    },
};

function DateOfBirthPage({translate, privatePersonalDetails}) {
    const styles = useThemeStyles();
    usePrivatePersonalDetails();
    const isLoadingPersonalDetails = lodashGet(privatePersonalDetails, 'isLoading', true);

    /**
     * @param {Object} values
     * @param {String} values.dob - date of birth
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback((values) => {
        const requiredFields = ['dob'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

        const minimumAge = CONST.DATE_BIRTH.MIN_AGE;
        const maximumAge = CONST.DATE_BIRTH.MAX_AGE;
        const dateError = ValidationUtils.getAgeRequirementError(values.dob, minimumAge, maximumAge);

        if (values.dob && dateError) {
            errors.dob = dateError;
        }

        return errors;
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={DateOfBirthPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.dob')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS)}
            />
            {isLoadingPersonalDetails ? (
                <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}
                    validate={validate}
                    onSubmit={PersonalDetails.updateDateOfBirth}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <NewDatePicker
                        inputID="dob"
                        label={translate('common.date')}
                        defaultValue={privatePersonalDetails.dob || ''}
                        minDate={subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE)}
                        maxDate={subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE)}
                    />
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

DateOfBirthPage.propTypes = propTypes;
DateOfBirthPage.defaultProps = defaultProps;
DateOfBirthPage.displayName = 'DateOfBirthPage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(DateOfBirthPage);
