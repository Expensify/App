import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import Form from '../../../../components/Form';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import NewDatePicker from '../../../../components/NewDatePicker';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';
import styles from '../../../../styles/styles';
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import FullscreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';

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
    usePrivatePersonalDetails();

    /**
     * @param {Object} values
     * @param {String} values.dob - date of birth
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback((values) => {
        const errors = {};
        const minimumAge = CONST.DATE_BIRTH.MIN_AGE;
        const maximumAge = CONST.DATE_BIRTH.MAX_AGE;

        if (!values.dob || !ValidationUtils.isValidDate(values.dob)) {
            errors.dob = 'common.error.fieldRequired';
        }
        const dateError = ValidationUtils.getAgeRequirementError(values.dob, minimumAge, maximumAge);
        if (dateError) {
            errors.dob = dateError;
        }

        return errors;
    }, []);

    if (lodashGet(privatePersonalDetails, 'isLoading', true)) {
        return <FullscreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('common.dob')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS)}
            />
            <Form
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
                    minDate={moment().subtract(CONST.DATE_BIRTH.MAX_AGE, 'years').toDate()}
                    maxDate={moment().subtract(CONST.DATE_BIRTH.MIN_AGE, 'years').toDate()}
                />
            </Form>
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
