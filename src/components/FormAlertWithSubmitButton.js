import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import OfflineIndicator from './OfflineIndicator';
import FormAlertWrapper from './FormAlertWrapper';

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
    onFixTheErrorsLinkPressed: PropTypes.func,

    /** Submit function */
    onSubmit: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    message: '',
    isDisabled: false,
    isMessageHtml: false,
    containerStyles: [],
    isLoading: false,
    onFixTheErrorsLinkPressed: () => {},
};

const FormAlertWithSubmitButton = (props) => {
    return (
        <FormAlertWrapper
            containerStyles={props.containerStyles}
            isAlertVisible={props.isAlertVisible}
            isMessageHtml={props.isMessageHtml}
            onFixTheErrorsLinkPressed={props.onFixTheErrorsLinkPressed}
        >
            {isOffline => (isOffline ? (
                <Button
                    success
                    isDisabled
                    text={props.buttonText}
                    style={[styles.mb3]}
                />
            ) : (
                <Button
                    success
                    pressOnEnter
                    text={props.buttonText}
                    onPress={props.onSubmit}
                    isDisabled={props.isDisabled}
                    isLoading={props.isLoading}
                />
            )
            )}
        </FormAlertWrapper>
    );
};

FormAlertWithSubmitButton.propTypes = propTypes;
FormAlertWithSubmitButton.defaultProps = defaultProps;
FormAlertWithSubmitButton.displayName = 'FormAlertWithSubmitButton';

export default withLocalize(FormAlertWithSubmitButton);
