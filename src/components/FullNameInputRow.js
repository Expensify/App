import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextInput from './TextInput';

const propTypes = {
    ...withLocalizePropTypes,

    /** Called when text is entered into the firstName input */
    onChangeFirstName: PropTypes.func.isRequired,

    /** Called when text is entered into the lastName input */
    onChangeLastName: PropTypes.func.isRequired,

    /** Used to prefill the firstName input, can also be used to make it a controlled input */
    firstName: PropTypes.string,

    /** Error message to display below firstName input */
    firstNameError: PropTypes.string,

    /** Used to prefill the lastName input, can also be used to make it a controlled input */
    lastName: PropTypes.string,

    /** Error message to display below lastName input */
    lastNameError: PropTypes.string,

    /** Additional styles to add after local styles */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),
};
const defaultProps = {
    firstName: '',
    firstNameError: '',
    lastName: '',
    lastNameError: '',
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
                    errorText={props.firstNameError}
                    onChangeText={props.onChangeFirstName}
                    placeholder={props.translate('profilePage.john')}
                />
            </View>
            <View style={[styles.flex1, styles.ml2]}>
                <TextInput
                    label={props.translate('common.lastName')}
                    value={props.lastName}
                    errorText={props.lastNameError}
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
