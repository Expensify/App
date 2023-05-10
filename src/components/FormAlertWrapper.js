import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import {withNetwork} from './OnyxProvider';
import RenderHTML from './RenderHTML';
import Text from './Text';
import TextLink from './TextLink';
import compose from '../libs/compose';
import networkPropTypes from './networkPropTypes';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** Wrapped child components */
    children: PropTypes.func.isRequired,

    /** Styles for container element */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether to show the alert text */
    isAlertVisible: PropTypes.bool,

    /** Whether message is in html format */
    isMessageHtml: PropTypes.bool,

    /** Error message to display above button */
    message: PropTypes.string,

    /** Props to detect online status */
    network: networkPropTypes.isRequired,

    /** Callback fired when the "fix the errors" link is pressed */
    onFixTheErrorsLinkPressed: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    containerStyles: [],
    isAlertVisible: false,
    isMessageHtml: false,
    message: '',
    onFixTheErrorsLinkPressed: () => {},
};

// The FormAlertWrapper offers a standardized way of showing error messages and offline functionality.
//
// This component takes other components as a child prop. It will then render any wrapped components as a function using "render props",
// and passes it a (bool) isOffline parameter. Child components can then use the isOffline variable to determine offline behavior.
const FormAlertWrapper = (props) => {
    let children;
    if (_.isEmpty(props.message)) {
        children = (
            <Text style={[styles.formError, styles.mb0]}>
                {`${props.translate('common.please')} `}
                <TextLink
                    style={styles.label}
                    onPress={props.onFixTheErrorsLinkPressed}
                >
                    {props.translate('common.fixTheErrors')}
                </TextLink>
                {` ${props.translate('common.inTheFormBeforeContinuing')}.`}
            </Text>
        );
    } else if (props.isMessageHtml) {
        children = <RenderHTML html={`<muted-text>${props.message}</muted-text>`} />;
    }
    return (
        <View style={props.containerStyles}>
            {props.isAlertVisible && (
                <FormHelpMessage message={props.message} style={[styles.mb3]}>
                    {children}
                </FormHelpMessage>
            )}
            {props.children(props.network.isOffline)}
        </View>
    );
};

FormAlertWrapper.propTypes = propTypes;
FormAlertWrapper.defaultProps = defaultProps;
FormAlertWrapper.displayName = 'FormAlertWrapper';

export default compose(
    withLocalize,
    withNetwork(),
)(FormAlertWrapper);
