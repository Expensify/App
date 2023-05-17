import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
import NewDatePicker from '../../../../components/NewDatePicker';
import CONST from '../../../../CONST';

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
        this.getYearFromRouteParams = this.getYearFromRouteParams.bind(this);
        this.minDate = moment().subtract(CONST.DATE_BIRTH.MAX_AGE, 'Y').toDate();
        this.maxDate = moment().subtract(CONST.DATE_BIRTH.MIN_AGE, 'Y').toDate();

        this.state = {
            selectedYear: '',
        };
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', this.getYearFromRouteParams);
    }

    componentWillUnmount() {
        this.props.navigation.removeListener('focus', this.getYearFromRouteParams);
    }

    /**
     * Function to be called to read year from params - necessary to read passed year from the Year picker which is a separate screen
     * It allows to display selected year in the calendar picker without overwriting this value in Onyx
     */
    getYearFromRouteParams() {
        const {params} = this.props.route;
        if (params && params.year) {
            this.setState({selectedYear: params.year});
        }
    }

    /**
     * Submit form to update user's first and last legal name
     * @param {Object} values
     * @param {String} values.dob - date of birth
     */
    updateDateOfBirth(values) {
        PersonalDetails.updateDateOfBirth(values.dob);
    }

    /**
     * @param {Object} values
     * @param {String} values.dob - date of birth
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};
        const minimumAge = CONST.DATE_BIRTH.MIN_AGE;
        const maximumAge = CONST.DATE_BIRTH.MAX_AGE;

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
                    <NewDatePicker
                        inputID="dob"
                        label={this.props.translate('common.date')}
                        defaultValue={privateDetails.dob || ''}
                        minDate={this.minDate}
                        maxDate={this.maxDate}
                        selectedYear={this.state.selectedYear}
                    />
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
