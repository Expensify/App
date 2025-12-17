import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import FormHelpMessage from './FormHelpMessage';
import RenderHTML from './RenderHTML';
import Text from './Text';
import TextLink from './TextLink';

type FormAlertWrapperProps = {
    /** Wrapped child components */
    children: (isOffline?: boolean) => ReactNode;

    /** Styles for container element */
    containerStyles?: StyleProp<ViewStyle>;

    /** Style for the error message for submit button */
    errorMessageStyle?: StyleProp<ViewStyle>;

    /** Whether to show the alert text */
    isAlertVisible?: boolean;

    /** Whether message is in html format */
    isMessageHtml?: boolean;

    /** Error message to display above button */
    message?: string;

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed?: () => void;
};

// The FormAlertWrapper offers a standardized way of showing error messages and offline functionality.
//
// This component takes other components as a child prop. It will then render any wrapped components as a function using "render props",
// and passes it a (bool) isOffline parameter. Child components can then use the isOffline variable to determine offline behavior.
function FormAlertWrapper({
    children,
    containerStyles,
    errorMessageStyle,
    isAlertVisible = false,
    isMessageHtml = false,
    message = '',
    onFixTheErrorsLinkPressed = () => {},
}: FormAlertWrapperProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    let content;
    if (!message?.length) {
        content = (
            <Text style={[styles.formError, styles.mb0]}>
                {`${translate('common.please')} `}
                <TextLink
                    style={styles.label}
                    onPress={onFixTheErrorsLinkPressed}
                >
                    {translate('common.fixTheErrors')}
                </TextLink>
                {` ${translate('common.inTheFormBeforeContinuing')}.`}
            </Text>
        );
    } else if (isMessageHtml && typeof message === 'string') {
        content = <RenderHTML html={`<alert-text>${message}</alert-text>`} />;
    }

    return (
        <View style={containerStyles}>
            {isAlertVisible && (
                <FormHelpMessage
                    message={message}
                    style={[styles.mb3, errorMessageStyle]}
                >
                    {content}
                </FormHelpMessage>
            )}
            {children(isOffline)}
        </View>
    );
}

export default FormAlertWrapper;
