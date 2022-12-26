import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Button from './Button';
import FormAlertWrapper from './FormAlertWrapper';

const propTypes = {
    /** Text for the button */
    buttonText: PropTypes.string.isRequired,

    /** Styles for container element */
    // eslint-disable-next-line react/forbid-prop-types
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
    onFixTheErrorsLinkPressed: PropTypes.func,

    /** Submit function */
    onSubmit: PropTypes.func.isRequired,

    /** Should the button be enabled when offline */
    enabledWhenOffline: PropTypes.bool,

    /** Disable press on enter for submit button */
    disablePressOnEnter: PropTypes.bool,

    /** Whether the action is dangerous */
    isDangerousAction: PropTypes.bool,
};

const defaultProps = {
    message: '',
    isDisabled: false,
    isMessageHtml: false,
    containerStyles: [],
    isLoading: false,
    onFixTheErrorsLinkPressed: () => {},
    enabledWhenOffline: false,
    disablePressOnEnter: false,
    isDangerousAction: false,
};

const FormAlertWithSubmitButton = props => (
    <FormAlertWrapper
        containerStyles={[styles.mh5, styles.mb5, styles.justifyContentEnd, ...props.containerStyles]}
        isAlertVisible={props.isAlertVisible}
        isMessageHtml={props.isMessageHtml}
        message={props.message}
        onFixTheErrorsLinkPressed={props.onFixTheErrorsLinkPressed}
    >
        {isOffline => ((isOffline && !props.enabledWhenOffline) ? (
            <Button
                success
                isDisabled
                text={props.buttonText}
                style={[styles.mb3]}
                danger={props.isDangerousAction}
            />
        ) : (
            <Button
                success
                pressOnEnter={!props.disablePressOnEnter}
                text={props.buttonText}
                onPress={props.onSubmit}
                isDisabled={props.isDisabled}
                isLoading={props.isLoading}
                danger={props.isDangerousAction}
            />
        ))}
    </FormAlertWrapper>
);

FormAlertWithSubmitButton.propTypes = propTypes;
FormAlertWithSubmitButton.defaultProps = defaultProps;
FormAlertWithSubmitButton.displayName = 'FormAlertWithSubmitButton';

export default FormAlertWithSubmitButton;
