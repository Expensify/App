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
    componentDidMount() {
        this.pressableRef.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.props.onSecondaryInteraction(e);
        });
    }

    componentWillUnmount() {
        this.pressableRef.removeEventListener('contextmenu');
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
