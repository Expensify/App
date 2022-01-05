import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextInput from './TextInput';
import * as PersonalDetails from '../libs/actions/PersonalDetails';

const propTypes = {
    ...withLocalizePropTypes,

    /** Called when text is entered into the firstName input */
    onChangeFirstName: PropTypes.func.isRequired,

    /** Called when text is entered into the lastName input */
    onChangeLastName: PropTypes.func.isRequired,

    /** Used to prefill the firstName input, can also be used to make it a controlled input */
    firstName: PropTypes.string,

    /** If first name input should show error */
    hasFirstNameError: PropTypes.bool,

    /** Used to prefill the lastName input, can also be used to make it a controlled input */
    lastName: PropTypes.string,

    /** If last name input should show error */
    hasLastNameError: PropTypes.bool,

    /** Additional styles to add after local styles */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),
};
const defaultProps = {
    firstName: '',
    hasFirstNameError: false,
    lastName: '',
    hasLastNameError: false,
    style: {},
};

const FullNameInputRow = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];
    return (
        <View style={[styles.flexRow, ...additionalStyles]}>
            <View style={styles.flex1}>
                <TextInput
                    label={props.translate('common.firstName')}
                    value={props.firstName}
                    errorText={PersonalDetails.getMaxCharacterError(props.hasFirstNameError)}
                    onChangeText={props.onChangeFirstName}
                    placeholder={props.translate('profilePage.john')}
                />
            </View>
            <View style={[styles.flex1, styles.ml2]}>
                <TextInput
                    label={props.translate('common.lastName')}
                    value={props.lastName}
                    errorText={PersonalDetails.getMaxCharacterError(props.hasLastNameError)}
                    onChangeText={props.onChangeLastName}
                    placeholder={props.translate('profilePage.doe')}
                />
            </View>
        </View>
    );
};

FullNameInputRow.displayName = 'FullNameInputRow';
FullNameInputRow.propTypes = propTypes;
FullNameInputRow.defaultProps = defaultProps;
export default withLocalize(FullNameInputRow);
