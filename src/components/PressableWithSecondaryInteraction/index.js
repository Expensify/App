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
        this.pressableRef = React.createRef();
    }

    componentDidMount() {
        this.pressableRef.current.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.props.onSecondaryInteraction(e);
        });
    }

    render() {
        const defaultPressableProps = _.omit(this.props, ['onSecondaryInteraction', 'children', 'onLongPress']);
        return (
            <Pressable
                onLongPress={e => this.props.onSecondaryInteraction(e)}
                ref={this.pressableRef}
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
