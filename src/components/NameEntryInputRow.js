import * as React from 'react';
import PropTypes from 'prop-types';
import {TextInput, View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import themeColors from '../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    ...withLocalizePropTypes,

    /** Called when text is entered into the firstName input */
    onChangeFirstName: PropTypes.func.isRequired,

    /** Called when text is entered into the lastName input */
    onChangeLastName: PropTypes.func.isRequired,

    /** Used to prefill the firstName input, can also be used to make it a controlled input */
    firstName: PropTypes.string,

    /** Placeholder text for the firstName input */
    firstNamePlaceholder: PropTypes.string,

    /** Used to prefill the lastName input, can also be used to make it a controlled input */
    lastName: PropTypes.string,

    /** Placeholder text for the lastName input */
    lastNamePlaceholder: PropTypes.string,

    /** Additional styles to add after local styles */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

};
const defaultProps = {
    firstName: '',
    firstNamePlaceholder: null,
    lastName: '',
    lastNamePlaceholder: null,
    style: {},
};

const NameEntryInputRow = ({
    translate,
    onChangeFirstName, onChangeLastName,
    firstName, lastName,
    firstNamePlaceholder,
    lastNamePlaceholder,
    style,
}) => {
    const additionalStyles = _.isArray(style) ? style : [style];
    return (
        <View style={[styles.flexRow, ...additionalStyles]}>
            <View style={styles.flex1}>
                <Text style={[styles.mb1, styles.formLabel]}>
                    {translate('common.firstName')}
                </Text>
                <TextInput
                    style={styles.textInput}
                    value={firstName}
                    onChangeText={onChangeFirstName}
                    placeholder={firstNamePlaceholder ?? translate('profilePage.john')}
                    placeholderTextColor={themeColors.placeholderText}
                />
            </View>
            <View style={[styles.flex1, styles.ml2]}>
                <Text style={[styles.mb1, styles.formLabel]}>
                    {translate('common.lastName')}
                </Text>
                <TextInput
                    style={styles.textInput}
                    value={lastName}
                    onChangeText={onChangeLastName}
                    placeholder={lastNamePlaceholder ?? translate('profilePage.doe')}
                    placeholderTextColor={themeColors.placeholderText}
                />
            </View>
        </View>
    );
}

NameEntryInputRow.displayName = 'NameEntryInputRow';
NameEntryInputRow.propTypes = propTypes;
NameEntryInputRow.defaultProps = defaultProps;
export default withLocalize(NameEntryInputRow);
