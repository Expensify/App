import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Button from './Button';
import FormAlertWrapper from './FormAlertWrapper';
import OfflineIndicator from './OfflineIndicator';

const propTypes = {
    /** Text for the button */
    buttonText: PropTypes.string.isRequired,

    /** Styles for container element */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether to show the alert text */
    isAlertVisible: PropTypes.bool.isRequired,

    /** Whether the button is disabled */
    isDisabled: PropTypes.bool,

    /** Is the button in a loading state */
    isLoading: PropTypes.bool,

    /** Whether message is in html format */
    isMessageHtml: PropTypes.bool,

    /** Error message to display above button */
    message: PropTypes.string,

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsPressed: PropTypes.func,

    /** Submit function */
    onSubmit: PropTypes.func.isRequired,
};

const defaultProps = {
    message: '',
    isDisabled: false,
    isMessageHtml: false,
    containerStyles: [],
    isLoading: false,
    onFixTheErrorsPressed: () => {},
};

const FormAlertWithSubmitButton = props => (
    <FormAlertWrapper
        containerStyles={[styles.mh5, styles.flex1, styles.justifyContentEnd, ...props.containerStyles]}
        isAlertVisible={props.isAlertVisible}
        isMessageHtml={props.isMessageHtml}
        message={props.message}
        onFixTheErrorsPressed={props.onFixTheErrorsPressed}
    >
        {isOffline => (isOffline ? (
            <>
                <Button
                    success
                    isDisabled
                    text={props.buttonText}
                />
                <OfflineIndicator containerStyles={[styles.mv1]} />
            </>
        ) : (
            <Button
                success
                pressOnEnter
                text={props.buttonText}
                onPress={props.onSubmit}
                isDisabled={props.isDisabled}
                isLoading={props.isLoading}
                style={[styles.mb6]}
            />
        ))}
    </FormAlertWrapper>
);

FormAlertWithSubmitButton.propTypes = propTypes;
FormAlertWithSubmitButton.defaultProps = defaultProps;
FormAlertWithSubmitButton.displayName = 'FormAlertWithSubmitButton';

export default FormAlertWithSubmitButton;
