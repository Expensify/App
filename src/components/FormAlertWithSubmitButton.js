import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import {Exclamation} from './Icon/Expensicons';
import colors from '../styles/colors';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextLink from './TextLink';
import Text from './Text';

const propTypes = {
    /** Whether to show the alert text */
    isAlertVisible: PropTypes.bool.isRequired,

    /** Submit function */
    onSubmit: PropTypes.func.isRequired,

    /** Text for the button */
    buttonText: PropTypes.string.isRequired,

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed: PropTypes.func.isRequired,

    /** Error message to display above button */
    message: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    message: '',
};

const FormAlertWithSubmitButton = ({
    isAlertVisible,
    onSubmit,
    buttonText,
    translate,
    onFixTheErrorsLinkPressed,
    message,
}) => {
    /**
     * @returns {React.Component}
     */
    function getAlertPrompt() {
        let error = '';

        if (!_.isEmpty(message)) {
            error = (
                <Text style={styles.mutedTextLabel}>{message}</Text>
            );
        } else {
            error = (
                <>
                    <Text style={styles.mutedTextLabel}>
                        {`${translate('common.please')} `}
                    </Text>
                    <TextLink
                        style={styles.label}
                        onPress={onFixTheErrorsLinkPressed}
                    >
                        {translate('common.fixTheErrors')}
                    </TextLink>
                    <Text style={styles.mutedTextLabel}>
                        {` ${translate('common.inTheFormBeforeContinuing')}.`}
                    </Text>
                </>
            );
        }

        return (
            <View style={[styles.flexRow, styles.ml2, styles.flexWrap, styles.flex1]}>
                {error}
            </View>
        );
    }

    return (
        <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd]}>
            {isAlertVisible && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                    <Icon src={Exclamation} fill={colors.red} />
                    {getAlertPrompt()}
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
};

FormAlertWithSubmitButton.propTypes = propTypes;
FormAlertWithSubmitButton.defaultProps = defaultProps;
export default withLocalize(FormAlertWithSubmitButton);
