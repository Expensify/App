import React from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    // Should we dim the view
    shouldDim: PropTypes.bool.isRequired,

    // Content to render
    children: PropTypes.node.isRequired,

    // Array of style objects
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    style: [],
};

class OpacityView extends React.Component {
    constructor(props) {
        super(props);
        this.opacity = new Animated.Value(1);
        this.undim = this.undim.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.shouldDim && this.props.shouldDim) {
            Animated.timing(this.opacity, {
                toValue: 0.5,
                duration: 50,
                useNativeDriver: true,
            }).start();
        }

        if (prevProps.shouldDim && !this.props.shouldDim) {
            this.undim();
        }
    }

    undim() {
        Animated.timing(this.opacity, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
        }).start(({finished}) => {
            // If animation doesn't finish because Animation.stop was called
            // (e.g. because it was interrupted by a gesture or another animation),
            // restart animation so we always make sure the component gets completely shown.
            if (finished) {
                return;
            }
            this.undim();
        });
    }

    render() {
        return (
            <Animated.View
                style={[{opacity: this.opacity}, ...this.props.style]}
            >
                {this.props.children}
            </Animated.View>
        );
    }
}

OpacityView.propTypes = propTypes;
OpacityView.defaultProps = defaultProps;
export default OpacityView;
