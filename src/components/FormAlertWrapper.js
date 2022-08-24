import {View} from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import {withNetwork} from './OnyxProvider';
import compose from '../libs/compose';
import networkPropTypes from './networkPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import FormAlertError from './FormAlertError';

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
    onFixTheErrorsPressed: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    containerStyles: [],
    isAlertVisible: false,
    isMessageHtml: false,
    message: '',
    onFixTheErrorsPressed: () => {},
};

// The FormAlertWrapper offers a standardized way of showing error messages and offline functionality.
//
// This component takes other components as a child prop. It will then render any wrapped components as a function using "render props",
// and passes it a (bool) isOffline parameter. Child components can then use the isOffline variable to determine offline behavior.
const FormAlertWrapper = props => (
    <View style={props.containerStyles}>
        {props.isAlertVisible && <FormAlertError message={props.message} isMessageHtml={props.isMessageHtml} />}
        {props.children(props.network.isOffline)}
    </View>
);

FormAlertWrapper.propTypes = propTypes;
FormAlertWrapper.defaultProps = defaultProps;
FormAlertWrapper.displayName = 'FormAlertWrapper';

export default compose(
    withLocalize,
    withNetwork(),
)(FormAlertWrapper);
