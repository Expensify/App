import _ from 'underscore';
import React, {Component} from 'react';
import {Pressable, Text as RNText} from 'react-native';
import {propTypes, defaultProps} from './pressableWithSecondaryInteractionPropTypes';

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked.
 */
class PressableWithSecondaryInteraction extends Component {
    constructor(props) {
        super(props);

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
     * @param {contextmenu} e - A right-click MouseEvent.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
     */
    executeSecondaryInteractionOnContextMenu(e) {
        const selection = window.getSelection().toString();
        e.stopPropagation();
        if (this.props.preventDefaultContentMenu) {
            e.preventDefault();
        }
        this.props.onSecondaryInteraction(e, selection);
    }

    render() {
        const defaultPressableProps = _.omit(this.props, ['onSecondaryInteraction', 'children', 'onLongPress']);
        const Node = this.props.inline ? RNText : Pressable;
        return (
            <Node
                onPressIn={this.props.onPressIn}
                onLongPress={this.props.onSecondaryInteraction}
                onPressOut={this.props.onPressOut}
                onPress={this.props.onPress}
                ref={el => this.pressableRef = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultPressableProps}
            >
                {this.props.children}
            </Node>
        );
    }
}

PressableWithSecondaryInteraction.propTypes = propTypes;
PressableWithSecondaryInteraction.defaultProps = defaultProps;
export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
