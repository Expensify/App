import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ExpensiTextInput from './ExpensiTextInput';

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

const FullNameInputRow = ({
    translate,
    onChangeFirstName, onChangeLastName,
    firstName, firstNameError,
    lastName, lastNameError,
    style,
}) => {
    const additionalStyles = _.isArray(style) ? style : [style];
    return (
        <View style={[styles.flexRow, ...additionalStyles]}>
            <View style={styles.flex1}>
                <ExpensiTextInput
                    label={translate('common.firstName')}
                    value={firstName}
                    errorText={firstNameError}
                    onChangeText={onChangeFirstName}
                    placeholder={translate('profilePage.john')}
                    translateX={-10}
                />
            </View>
            <View style={[styles.flex1, styles.ml2]}>
                <ExpensiTextInput
                    label={translate('common.lastName')}
                    value={lastName}
                    errorText={lastNameError}
                    onChangeText={onChangeLastName}
                    placeholder={translate('profilePage.doe')}
                    translateX={-10}
                />
            </View>
        </View>
    );
};

FullNameInputRow.displayName = 'FullNameInputRow';
FullNameInputRow.propTypes = propTypes;
FullNameInputRow.defaultProps = defaultProps;
export default withLocalize(FullNameInputRow);
