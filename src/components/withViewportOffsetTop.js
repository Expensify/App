import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import addViewportResizeListener from '../libs/VisualViewport';

const viewportOffsetTopPropTypes = {
    viewportOffsetTop: PropTypes.number.isRequired,
};

export default function (WrappedComponent) {
    class WithViewportOffsetTop extends Component {
        constructor(props) {
            super(props);

            this.updateDimensions = this.updateDimensions.bind(this);

            this.state = {
                viewportOffsetTop: 0,
            };
        }

        componentDidMount() {
            this.removeViewportResizeListener = addViewportResizeListener(this.updateDimensions);
        }

        componentWillUnmount() {
            this.removeViewportResizeListener();
        }

        /**
         * @param {SyntheticEvent} e
         */
        updateDimensions(e) {
            const viewportOffsetTop = lodashGet(e, 'target.offsetTop', 0);
            this.setState({viewportOffsetTop});
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    ref={this.props.forwardedRef}
                    viewportOffsetTop={this.state.viewportOffsetTop}
                />
            );
        }
    }

    WithViewportOffsetTop.displayName = `WithViewportOffsetTop(${getComponentDisplayName(WrappedComponent)})`;
    WithViewportOffsetTop.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithViewportOffsetTop.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithViewportOffsetTop {...props} forwardedRef={ref} />
    ));
}

export {
    viewportOffsetTopPropTypes,
};
