import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
} from 'react-native';
import compose from '../libs/compose';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import {withNetwork, withPersonalDetails} from '../components/OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Icon from '../components/Icon';
import * as Expensicons from '../components/Icon/Expensicons';
import Text from '../components/Text';
import styles from '../styles/styles';
import variables from '../styles/variables';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Styles to pass to View wrapper */
    outerContainerStyles: stylePropTypes,

    /** Styles to be passed in inner container, for example margin  */
    innerContainerStyles: stylePropTypes,

    /** Styles to be passed as offline message Text style */
    messageStyles: stylePropTypes,

    /** If set to true, retain styles and message is set to empty string */
    showEmptyStringOnOnline: PropTypes.bool,

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** Text or string to be be displayed when network is offline  */
    message: PropTypes.string,

    /** Component to be displayed if network is online */
    alternateComponent: PropTypes.object,

    ...withLocalizePropTypes,
};

const defaultProps = {
    network: {isOffline: false},
    outerContainerStyles : [],
    innerContainerStyles: [],
    showEmptyStringOnOnline: false,
    messageStyles: [],
    message: '',
    alternateComponent: null,
};

class OfflineText extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const offlineContent = (
            <>
                <View>
                    <Icon
                        src={Expensicons.Offline}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                </View>
                <Text style={[styles.offlineTextMessageStyle, ...this.props.messageStyles]}>
                    {this.props.message || this.props.translate('reportActionCompose.youAppearToBeOffline')}
                </Text>
             </>);

        const content = 
            //!this.props.network.isOffline && this.props.showEmptyStringOnOnline 
            false && this.props.showEmptyStringOnOnline 
            ? null 
            : offlineContent 
        return (
            //this.props.network.isOffline || this.props.showEmptyStringOnOnline ? (
            true?(
                <View style={this.props.outerContainerStyles}>
                    <View style={[styles.flexRow, ...this.props.innerContainerStyles, {width: '100%'}]}
                    >
                        {content} 
                    </View>
                </View>
            ) : this.props.alternateComponent 
        );
    }
}

OfflineText.propTypes = propTypes;
OfflineText.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
)(OfflineText);
