import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import {Exclamation} from './Icon/Expensicons';
import colors from '../styles/colors';
import Button from './Button';

const propTypes = {
    /** Whether to show the alert text */
    isAlertVisible: PropTypes.bool.isRequired,

    /** React component to display */
    AlertComponent: PropTypes.func.isRequired,

    /** Submit function */
    onSubmit: PropTypes.func.isRequired,

    /** Text for the button */
    buttonText: PropTypes.string.isRequired,
};

const FormAlertWithSubmitButton = ({
    AlertComponent, isAlertVisible, onSubmit, buttonText,
}) => (
    <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd]}>
        {isAlertVisible && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                <Icon src={Exclamation} fill={colors.red} />
                <AlertComponent />
            </View>
        )}
        <Button
            success
            text={buttonText}
            onPress={onSubmit}
            pressOnEnter
        />
    </View>
);

FormAlertWithSubmitButton.propTypes = propTypes;
export default FormAlertWithSubmitButton;
