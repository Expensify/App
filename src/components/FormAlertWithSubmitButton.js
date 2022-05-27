import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import colors from '../styles/colors';
import compose from '../libs/compose';
import Button from './Button';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextLink from './TextLink';
import Text from './Text';
import RenderHTML from './RenderHTML';
import OfflineIndicator from './OfflineIndicator';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';

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
    onFixTheErrorsLinkPressed: PropTypes.func,

    /** Error message to display above button */
    message: PropTypes.string,

    /** Whether message is in html format */
    isMessageHtml: PropTypes.bool,

    /** Styles for container element */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Is the button in a loading state */
    isLoading: PropTypes.bool,

    ...withLocalizePropTypes,

    /** Props to detect online status */
    network: networkPropTypes.isRequired,
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
    /**
     * @returns {React.Component}
     */
    function getAlertPrompt() {
        let error = '';

        if (!_.isEmpty(props.message)) {
            if (props.isMessageHtml) {
                error = (
                    <RenderHTML html={`<muted-text>${props.message}</muted-text>`} />
                );
            } else {
                error = (
                    <Text style={styles.mutedTextLabel}>{props.message}</Text>
                );
            }
        } else {
            error = (
                <>
                    <Text style={styles.mutedTextLabel}>
                        {`${props.translate('common.please')} `}
                    </Text>
                    <TextLink
                        style={styles.label}
                        onPress={props.onFixTheErrorsLinkPressed}
                    >
                        {props.translate('common.fixTheErrors')}
                    </TextLink>
                    <Text style={styles.mutedTextLabel}>
                        {` ${props.translate('common.inTheFormBeforeContinuing')}.`}
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

    if (props.network.isOffline) {
        return (
            <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd, ...props.containerStyles]}>
                <Button
                    success
                    isDisabled
                    text={props.buttonText}
                />
                <OfflineIndicator />
            </View>
        );
    }

    return (
        <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd, ...props.containerStyles]}>
            {props.isAlertVisible && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                    <Icon src={Expensicons.Exclamation} fill={colors.red} />
                    {getAlertPrompt()}
                </View>
            )}
            <Button
                success
                pressOnEnter
                text={props.buttonText}
                onPress={props.onSubmit}
                isDisabled={props.isDisabled}
                isLoading={props.isLoading}
            />
        </View>
    );
};

FormAlertWithSubmitButton.propTypes = propTypes;
FormAlertWithSubmitButton.defaultProps = defaultProps;
FormAlertWithSubmitButton.displayName = 'FormAlertWithSubmitButton';

export default compose(
    withLocalize,
    withNetwork(),
)(FormAlertWithSubmitButton);
