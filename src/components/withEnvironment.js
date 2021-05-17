import React, {Component} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import Environment from '../libs/Environment';
import CONST from '../CONST';

const environmentPropTypes = {
    /** The string value representing the current environment */
    environment: PropTypes.string.isRequired,
};

export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: PropTypes.func,
    };

    const defaultProps = {
        forwardedRef: () => {},
    };

    class WithEnvironment extends Component {
        constructor(props) {
            super(props);

            this.state = {
                environment: CONST.ENVIRONMENT.PRODUCTION,
            };
        }

        componentDidMount() {
            Environment.getEnvironment()
                .then((environment) => {
                    this.setState({environment});
                });
        }

        render() {
            const {forwardedRef, ...rest} = this.props;
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    ref={forwardedRef}
                    environment={this.state.environment}
                />
            );
        }
    }

    WithEnvironment.propTypes = propTypes;
    WithEnvironment.defaultProps = defaultProps;
    WithEnvironment.displayName = `withEnvironment(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithEnvironment {...props} forwardedRef={ref} />
    ));
}

export {
    environmentPropTypes,
};
