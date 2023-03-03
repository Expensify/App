import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import moment from 'moment';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';
import DatePicker from '../../../../components/DatePicker';

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

class DateOfBirthPage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updateDateOfBirth = this.updateDateOfBirth.bind(this);
        this.state = {
            defaultMonth: undefined,
            defaultYear: undefined,
        };

        this.onDateChanged = this.onDateChanged.bind(this);
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            const {params} = this.props.route;

            if (params && params.year) {
                this.setState(prev => ({...prev, defaultYear: params.year}));
            }
        });
    }

    onDateChanged(date) {
        this.setState(prev => ({...prev, defaultYear: moment(date).year().toString(), defaultMonth: moment(date).month().toString()}));
    }

    /**
     * Submit form to update user's first and last legal name
     * @param {Object} values
     * @param {String} values.dob - date of birth
     */
    updateDateOfBirth(values) {
        PersonalDetails.updateDateOfBirth(
            values.dob,
        );
    }

    /**
     * @param {Object} values
     * @param {String} values.dob - date of birth
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};
        const minimumAge = 5;
        const maximumAge = 150;

        if (!values.dob || !ValidationUtils.isValidDate(values.dob)) {
            errors.dob = this.props.translate('common.error.fieldRequired');
        }
        const dateError = ValidationUtils.getAgeRequirementError(values.dob, minimumAge, maximumAge);
        if (dateError) {
            errors.dob = dateError;
        }

        return errors;
    }

    render() {
        const privateDetails = this.props.privatePersonalDetails || {};

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('common.dob')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}
                    validate={this.validate}
                    onSubmit={this.updateDateOfBirth}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View>
                        <DatePicker
                            placeholder="yyyy-mm-dd"
                            inputID="dob"
                            label={this.props.translate('common.date')}
                            defaultValue={privateDetails.dob || ''}
                            shouldSaveDraft
                            minDate={moment().subtract(150, 'years').toDate()}
                            maxDate={moment().subtract(5, 'years').toDate()}
                            defaultMonth={this.state.defaultMonth}
                            defaultYear={this.state.defaultYear}
                            onDateChanged={this.onDateChanged}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

DateOfBirthPage.propTypes = propTypes;
DateOfBirthPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(DateOfBirthPage);
