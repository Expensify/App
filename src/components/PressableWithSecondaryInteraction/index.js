import _ from 'underscore';
import React, {Component} from 'react';
import {Pressable} from 'react-native';
import {LongPressGestureHandler, State} from 'react-native-gesture-handler';
import SelectionScraper from '../../libs/SelectionScraper';
import * as pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';
import styles from '../../styles/styles';

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked.
 */
class PressableWithSecondaryInteraction extends Component {
    constructor(props) {
        super(props);
        this.onLongPressGestureHandlerStateChange = this.onLongPressGestureHandlerStateChange.bind(this);
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
     * @param {Object} e
     */
    onLongPressGestureHandlerStateChange(e) {
        if (e.nativeEvent.state !== State.ACTIVE) {
            return;
        }

        // map gesture event to normal ResponderEvent event
        const {
            absoluteX, absoluteY, locationX, locationY,
        } = e.nativeEvent;
        const mapEvent = {
            ...e,
            nativeEvent: {
                ...e.nativeEvent, pageX: absoluteX, pageY: absoluteY, x: locationX, y: locationY,
            },
        };
        this.props.onSecondaryInteraction(mapEvent);
    }

    /**
     * @param {contextmenu} e - A right-click MouseEvent.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
     */
    executeSecondaryInteractionOnContextMenu(e) {
        const selection = SelectionScraper.getAsMarkdown();
        e.stopPropagation();
        if (this.props.preventDefaultContentMenu) {
            e.preventDefault();
        }
        this.props.onSecondaryInteraction(e, selection);
    }

    render() {
        const defaultPressableProps = _.omit(this.props, ['onSecondaryInteraction', 'children', 'onLongPress']);

        // On Web, Text does not support LongPress events thus manage inline mode with styling instead of using Text.
        return (
            <LongPressGestureHandler onHandlerStateChange={this.onLongPressGestureHandlerStateChange}>
                <Pressable
                    style={this.props.inline && styles.dInline}
                    onPressIn={this.props.onPressIn}
                    onPressOut={this.props.onPressOut}
                    onPress={this.props.onPress}
                    ref={el => this.pressableRef = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultPressableProps}
                >
                    {this.props.children}
                </Pressable>
            </LongPressGestureHandler>
        );
    }
}

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes.propTypes;
PressableWithSecondaryInteraction.defaultProps = pressableWithSecondaryInteractionPropTypes.defaultProps;
export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
