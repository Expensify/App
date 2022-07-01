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
    /** Text for the button */
    buttonText: PropTypes.string,

    /** Allow custom buttons and components to be wrapped by FormAlertWithSubmitButton */
    children: PropTypes.node,

    /** Styles for container element */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether to show the alert text */
    isAlertVisible: PropTypes.bool,

    /** Whether the button is disabled */
    isDisabled: PropTypes.bool,

    /** Is the button in a loading state */
    isLoading: PropTypes.bool,

    /** Whether message is in html format */
    isMessageHtml: PropTypes.bool,

    /** Error message to display above button */
    message: PropTypes.string,

    /** Props to detect online status */
    network: networkPropTypes.isRequired,

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed: PropTypes.func,

    /** Submit function */
    onSubmit: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    buttonText: '',
    children: null,
    containerStyles: [],
    isAlertVisible: false,
    isDisabled: false,
    isLoading: false,
    isMessageHtml: false,
    message: '',
    onFixTheErrorsLinkPressed: () => {},
    onSubmit: () => {},
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

    if (props.network.isOffline && !props.children) {
        return (
            <View style={[styles.mh5, styles.mb5, styles.flex1, styles.justifyContentEnd, ...props.containerStyles]}>
                <Button
                    success
                    isDisabled
                    text={props.buttonText}
                    style={[styles.mb3]}
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
            {props.children ? (
                props.children(props.network.isOffline)
            ) : (
                <Button
                    success
                    pressOnEnter
                    text={props.buttonText}
                    onPress={props.onSubmit}
                    isDisabled={props.isDisabled}
                    isLoading={props.isLoading}
                />
            )}
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
