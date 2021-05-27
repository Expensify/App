import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getEnvironment} from '../libs/Environment/Environment';
import CONST from '../CONST';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const environmentPropTypes = {
    /** The string value representing the current environment */
    environment: PropTypes.string.isRequired,
};

export default function (WrappedComponent) {
    class WithEnvironment extends Component {
        constructor(props) {
            super(props);

            this.state = {
                environment: CONST.ENVIRONMENT.PRODUCTION,
            };
        }

        componentDidMount() {
            getEnvironment()
                .then((environment) => {
                    this.setState({environment});
                });
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    ref={this.props.forwardedRef}
                    environment={this.state.environment}
                />
            );
        }
    }

    WithEnvironment.displayName = `withEnvironment(${getComponentDisplayName(WrappedComponent)})`;
    WithEnvironment.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithEnvironment.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithEnvironment {...props} forwardedRef={ref} />
    ));
}

export {
    environmentPropTypes,
};
