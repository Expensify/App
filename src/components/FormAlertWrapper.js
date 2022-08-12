import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import {withNetwork} from './OnyxProvider';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import RenderHTML from './RenderHTML';
import TextLink from './TextLink';
import Text from './Text';
import colors from '../styles/colors';
import compose from '../libs/compose';
import networkPropTypes from './networkPropTypes';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Wrapped child components */
    children: PropTypes.func.isRequired,

    /** Styles for container element */
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
class FormAlertWrapper extends React.Component {
    renderMessage() {
        if (_.isEmpty(this.props.message)) {
            return (
                <>
                    <Text style={styles.mutedTextLabel}>
                        {`${this.props.translate('common.please')} `}
                    </Text>
                    <TextLink
                        style={styles.label}
                        onPress={this.props.onFixTheErrorsPressed}
                    >
                        {this.props.translate('common.fixTheErrors')}
                    </TextLink>
                    <Text style={styles.mutedTextLabel}>
                        {` ${this.props.translate('common.inTheFormBeforeContinuing')}.`}
                    </Text>
                </>
            );
        }

        if (this.props.isMessageHtml) {
            return <RenderHTML html={`<muted-text>${this.props.message}</muted-text>`} />;
        }

        return <Text style={styles.mutedTextLabel}>{this.props.message}</Text>;
    }

    render() {
        return (
            <View style={this.props.containerStyles}>
                {this.props.isAlertVisible && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                        <Icon src={Expensicons.Exclamation} fill={colors.red} />
                        <View style={[styles.flexRow, styles.ml2, styles.flexWrap, styles.flex1]}>
                            {this.renderMessage()}
                        </View>
                    </View>
                )}
                {this.props.children(this.props.network.isOffline)}
            </View>
        );
    }
}

FormAlertWrapper.propTypes = propTypes;
FormAlertWrapper.defaultProps = defaultProps;
FormAlertWrapper.displayName = 'FormAlertWrapper';

export default compose(
    withLocalize,
    withNetwork(),
)(FormAlertWrapper);
