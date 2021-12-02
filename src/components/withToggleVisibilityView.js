import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const toggleVisibilityViewPropTypes = {
    /** Whether the content is viToggleVisibilitysible. */
    isVisible: PropTypes.bool,
};

export default function (WrappedComponent) {
    class WithToggleVisibilityView extends Component {
        componentDidUpdate(prevProps) {
            if (prevProps.isVisible || !this.props.isVisible || !this.focusableElement) {
                return;
            }
            this.focusableElement.focus();
        }

        render() {
            return (
                <View style={!this.props.isVisible && styles.visuallyHidden}>
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...this.props}
                        ref={this.props.forwardedRef}
                        isVisible={this.props.isVisible}
                    />
                </View>

            );
        }
    }

    WithToggleVisibilityView.displayName = `WithToggleVisibilityView(${getComponentDisplayName(WrappedComponent)})`;
    WithToggleVisibilityView.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),

        /** Whether the content is visible. */
        isVisible: PropTypes.bool,
    };
    WithToggleVisibilityView.defaultProps = {
        forwardedRef: undefined,
        isVisible: false,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithToggleVisibilityView {...props} forwardedRef={ref} />
    ));
}

export {
    toggleVisibilityViewPropTypes,
};
