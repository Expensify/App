import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import {withNetwork} from './OnyxProvider';
import networkPropTypes from './networkPropTypes';
import Text from './Text';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

    /** The error to display  */
    error: PropTypes.string,

    /** A function to run when the X button next to the error is clicked */
    onClose: PropTypes.func.isRequired,

    /** The content that needs offline feedback */
    children: PropTypes.node.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Additional styles to add after local styles. Applied to Pressable portion of button */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),
    ...withLocalizePropTypes,
};

const defaultProps = {
    pendingAction: null,
    error: null,
    style: [],
};

class OfflineWithFeedback extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    applyStrikeThrough(children) {
        return React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) {
                return child;
            }

            const props = {style: StyleUtils.combineStyles(child.props.style, styles.offlineFeedback.deleted)};
            if (child.props.children) {
                props.children = this.applyStrikeThrough(child.props.children);
            }

            return React.cloneElement(child, props);
        });
    }

    render() {
        const isOfflinePendingAction = this.props.network.isOffline && this.props.pendingAction;
        const isUpdateOrDeleteError = this.props.error && (this.props.pendingAction === 'delete' || this.props.pendingAction === 'update');
        const isAddError = this.props.error && this.props.pendingAction === 'add';
        const needsOpacity = (isOfflinePendingAction && !isUpdateOrDeleteError) || isAddError;
        const needsStrikeThrough = this.props.network.isOffline && this.props.pendingAction === 'delete';
        const hideChildren = !this.props.network.isOffline && this.props.pendingAction === 'delete';
        let children = this.props.children;

        // Apply strikethrough to children if needed, but skip it if we are not going to render them
        if (needsStrikeThrough && !hideChildren) {
            children = this.applyStrikeThrough(children);
        }
        return (
            <View style={this.props.style}>
                {!hideChildren && (
                    <View style={needsOpacity ? styles.offlineFeedback.pending : {}}>
                        {children}
                    </View>
                )}
                {this.props.error && (
                    <View style={styles.offlineFeedback.error}>
                        <View style={styles.offlineFeedback.errorDot} />
                        <Text style={styles.offlineFeedback.text}>{this.props.error}</Text>
                        <Tooltip text={this.props.translate('common.close')} containerStyles={styles.offlineFeedback.close}>
                            <Pressable
                                onPress={this.props.onClose}
                                style={[styles.touchableButtonImage, styles.mr0]}
                                accessibilityRole="button"
                                accessibilityLabel={this.props.translate('common.close')}
                            >
                                <Icon src={Expensicons.Close} />
                            </Pressable>
                        </Tooltip>
                    </View>
                )}
            </View>
        );
    }
}

OfflineWithFeedback.propTypes = propTypes;
OfflineWithFeedback.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
)(OfflineWithFeedback);
