import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';

const propTypes = {
    // The function that should be called when this pressable is LongPressed or right-clicked.
    onSecondaryInteraction: PropTypes.func.isRequired,

    // The children which should be contained in this wrapper component.
    children: PropTypes.node.isRequired,
};

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked.
 */
class PressableWithSecondaryInteraction extends Component {
    constructor(props) {
        super(props);

        this.executeSecondaryInteractionOnContextMenu = this.executeSecondaryInteractionOnContextMenu.bind(this);
    }

    componentDidMount() {
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
        e.preventDefault();
        this.props.onSecondaryInteraction(e, selection);
    }

    render() {
        const defaultPressableProps = _.omit(this.props, ['onSecondaryInteraction', 'children', 'onLongPress']);
        return (
            <Pressable
                onLongPress={e => this.props.onSecondaryInteraction(e)}
                ref={el => this.pressableRef = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultPressableProps}
            >
                {this.props.children}
            </Pressable>
        );
    }
}

PressableWithSecondaryInteraction.propTypes = propTypes;

export default PressableWithSecondaryInteraction;
