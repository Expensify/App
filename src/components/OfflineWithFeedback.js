import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import {withNetwork} from './OnyxProvider';
import CONST from '../CONST';
import networkPropTypes from './networkPropTypes';
import stylePropTypes from '../styles/stylePropTypes';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import * as StyleUtils from '../styles/StyleUtils';
import DotIndicatorMessage from './DotIndicatorMessage';
import shouldRenderOffscreen from '../libs/shouldRenderOffscreen';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

/**
 * This component should be used when we are using the offline pattern B (offline with feedback).
 * You should enclose any element that should have feedback that the action was taken offline and it will take
 * care of adding the appropriate styles for pending actions and displaying the dismissible error.
 */

const propTypes = {
    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

    /** Determine whether to hide the component's children if deletion is pending */
    shouldHideOnDelete: PropTypes.bool,

    /** The errors to display  */
    // eslint-disable-next-line react/forbid-prop-types
    errors: PropTypes.object,

    /** Whether we should show the error messages */
    shouldShowErrorMessages: PropTypes.bool,

    /** Whether we should disable opacity */
    shouldDisableOpacity: PropTypes.bool,

    /** A function to run when the X button next to the error is clicked */
    onClose: PropTypes.func,

    /** The content that needs offline feedback */
    children: PropTypes.node.isRequired,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Additional styles to add after local styles. Applied to the parent container */
    style: stylePropTypes,

    /** Additional styles to add after local styles. Applied to the children wrapper container */
    contentContainerStyle: stylePropTypes,

    /** Additional style object for the error row */
    errorRowStyles: stylePropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    pendingAction: null,
    shouldHideOnDelete: true,
    errors: null,
    shouldShowErrorMessages: true,
    shouldDisableOpacity: false,
    onClose: () => {},
    style: [],
    contentContainerStyle: [],
    errorRowStyles: [],
};

/**
 * This method applies the strikethrough to all the children passed recursively
 * @param {Array} children
 * @return {Array}
 */
function applyStrikeThrough(children) {
    return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
            return child;
        }
        const props = {style: StyleUtils.combineStyles(child.props.style, styles.offlineFeedback.deleted, styles.userSelectNone)};
        if (child.props.children) {
            props.children = applyStrikeThrough(child.props.children);
        }
        return React.cloneElement(child, props);
    });
}

function OfflineWithFeedback(props) {
    const hasErrors = !_.isEmpty(props.errors);

    // Some errors have a null message. This is used to apply opacity only and to avoid showing redundant messages.
    const errorMessages = _.omit(props.errors, (e) => e === null);
    const hasErrorMessages = !_.isEmpty(errorMessages);
    const isOfflinePendingAction = props.network.isOffline && props.pendingAction;
    const isUpdateOrDeleteError = hasErrors && (props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
    const isAddError = hasErrors && props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    const needsOpacity = !props.shouldDisableOpacity && ((isOfflinePendingAction && !isUpdateOrDeleteError) || isAddError);
    const needsStrikeThrough = props.network.isOffline && props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const hideChildren = props.shouldHideOnDelete && !props.network.isOffline && props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !hasErrors;
    let children = props.children;

    // Apply strikethrough to children if needed, but skip it if we are not going to render them
    if (needsStrikeThrough && !hideChildren) {
        children = applyStrikeThrough(children);
    }
    return (
        <View style={props.style}>
            {!hideChildren && (
                <View
                    style={[needsOpacity ? styles.offlineFeedback.pending : {}, props.contentContainerStyle]}
                    needsOffscreenAlphaCompositing={shouldRenderOffscreen ? needsOpacity && props.needsOffscreenAlphaCompositing : undefined}
                >
                    {children}
                </View>
            )}
            {props.shouldShowErrorMessages && hasErrorMessages && (
                <View style={StyleUtils.combineStyles(styles.offlineFeedback.error, props.errorRowStyles)}>
                    <DotIndicatorMessage
                        style={[styles.flex1]}
                        messages={errorMessages}
                        type="error"
                    />
                    <Tooltip text={props.translate('common.close')}>
                        <PressableWithoutFeedback
                            onPress={props.onClose}
                            style={[styles.touchableButtonImage]}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            accessibilityLabel={props.translate('common.close')}
                        >
                            <Icon src={Expensicons.Close} />
                        </PressableWithoutFeedback>
                    </Tooltip>
                </View>
            )}
        </View>
    );
}

OfflineWithFeedback.propTypes = propTypes;
OfflineWithFeedback.defaultProps = defaultProps;
OfflineWithFeedback.displayName = 'OfflineWithFeedback';

export default compose(withLocalize, withNetwork())(OfflineWithFeedback);
