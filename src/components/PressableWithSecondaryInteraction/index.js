import _ from 'underscore';
import React, {Component} from 'react';
import {Pressable} from 'react-native';
import * as pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';
import styles from '../../styles/styles';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import * as StyleUtils from '../../styles/StyleUtils';

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked.
 */
class PressableWithSecondaryInteraction extends Component {
    constructor(props) {
        super(props);
        this.executeSecondaryInteraction = this.executeSecondaryInteraction.bind(this);
        this.executeSecondaryInteractionOnContextMenu = this.executeSecondaryInteractionOnContextMenu.bind(this);
    }

    componentDidMount() {
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.pressableRef);
        }
        this.pressableRef.addEventListener('contextmenu', this.executeSecondaryInteractionOnContextMenu);
    }

    componentWillUnmount() {
        this.pressableRef.removeEventListener('contextmenu', this.executeSecondaryInteractionOnContextMenu);
    }

    /**
     * @param {Event} e - the secondary interaction event
     */
    executeSecondaryInteraction(e) {
        if (DeviceCapabilities.hasHoverSupport() && !this.props.enableLongPressWithHover) {
            return;
        }
        if (this.props.withoutFocusOnSecondaryInteraction && this.pressableRef) {
            this.pressableRef.blur();
        }
        this.props.onSecondaryInteraction(e);
    }

    /**
     * @param {contextmenu} e - A right-click MouseEvent.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
     */
    executeSecondaryInteractionOnContextMenu(e) {
        if (!this.props.onSecondaryInteraction) {
            return;
        }

        e.stopPropagation();
        if (this.props.preventDefaultContextMenu) {
            e.preventDefault();
        }

        /**
         * This component prevents the tapped element from capturing focus.
         * We need to blur this element when clicked as it opens modal that implements focus-trapping.
         * When the modal is closed it focuses back to the last active element.
         * Therefore it shifts the element to bring it back to focus.
         * https://github.com/Expensify/App/issues/14148
         */
        if (this.props.withoutFocusOnSecondaryInteraction && this.pressableRef) {
            this.pressableRef.blur();
        }
        this.props.onSecondaryInteraction(e);
    }

    render() {
        const defaultPressableProps = _.omit(this.props, ['onSecondaryInteraction', 'children', 'onLongPress']);

        // On Web, Text does not support LongPress events thus manage inline mode with styling instead of using Text.
        return (
            <Pressable
                style={StyleUtils.combineStyles(this.props.inline ? styles.dInline : this.props.style)}
                onPressIn={this.props.onPressIn}
                onLongPress={this.props.onSecondaryInteraction ? this.executeSecondaryInteraction : undefined}
                onPressOut={this.props.onPressOut}
                onPress={this.props.onPress}
                ref={(el) => (this.pressableRef = el)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultPressableProps}
            >
                {this.props.children}
            </Pressable>
        );
    }
}

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes.propTypes;
PressableWithSecondaryInteraction.defaultProps = pressableWithSecondaryInteractionPropTypes.defaultProps;
export default React.forwardRef((props, ref) => (
    <PressableWithSecondaryInteraction
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
