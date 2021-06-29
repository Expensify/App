import _ from 'underscore';
import React, {Component} from 'react';
import {Pressable} from 'react-native';
import pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';

const defaultProps = {
    forwardedRef: () => {},
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
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.pressableRef);
        }
        this.pressableRef.addEventListener('contextmenu', this.executeSecondaryInteractionOnContextMenu);
        this.pressableRef.addEventListener('touchstart', this.preventDefault);
    }

    componentWillUnmount() {
        this.pressableRef.removeEventListener('contextmenu', this.executeSecondaryInteractionOnContextMenu);
        this.pressableRef.removeEventListener('touchstart', this.preventDefault);
    }

    /**
     * @param {touchstart} e - TouchEvent.
     * https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
     */
    preventDefault = (e) => {
        e.preventDefault();
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

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes;
PressableWithSecondaryInteraction.defaultProps = defaultProps;
export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
