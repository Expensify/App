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
import RenderHTML from './RenderHTML';

const propTypes = {
    /** Whether to show the alert text */
    isAlertVisible: PropTypes.bool.isRequired,

    /** Whether the button is disabled */
    isDisabled: PropTypes.bool,

    /** Submit function */
    onSubmit: PropTypes.func.isRequired,

    /** Text for the button */
    buttonText: PropTypes.string.isRequired,

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed: PropTypes.func.isRequired,

    /** Error message to display above button */
    message: PropTypes.string,

    /** Whether message is in html format */
    isMessageHtml: PropTypes.bool,

    /** Styles for container element */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Is the button in a loading state */
    isLoading: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    message: '',
    isDisabled: false,
    isMessageHtml: false,
    containerStyles: [],
    isLoading: false,
};

const FormAlertWithSubmitButton = ({
    isAlertVisible,
    isDisabled,
    onSubmit,
    buttonText,
    translate,
    onFixTheErrorsLinkPressed,
    message,
    isMessageHtml,
    containerStyles,
    isLoading,
}) => {
    /**
     * @returns {React.Component}
     */
    function getAlertPrompt() {
        let error = '';

        if (!_.isEmpty(message)) {
            if (isMessageHtml) {
                error = (
                    <RenderHTML html={`<muted-text>${message}</muted-text>`} />
                );
            } else {
                error = (
                    <Text style={styles.mutedTextLabel}>{message}</Text>
                );
            }
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
        <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd, ...containerStyles]}>
            {isAlertVisible && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                    <Icon src={Exclamation} fill={colors.red} />
                    {getAlertPrompt()}
                </View>
            )}
            <Button
                success
                pressOnEnter
                text={buttonText}
                onPress={onSubmit}
                isDisabled={isDisabled}
                isLoading={isLoading}
            />
        </View>
    );
};

FormAlertWithSubmitButton.propTypes = propTypes;
FormAlertWithSubmitButton.defaultProps = defaultProps;
FormAlertWithSubmitButton.displayName = 'FormAlertWithSubmitButton';

export default withLocalize(FormAlertWithSubmitButton);
