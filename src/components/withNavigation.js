import React from 'react';
import PropTypes from 'prop-types';
import {useNavigation} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const withNavigationPropTypes = {
    navigation: PropTypes.object.isRequired,
};

export default function withNavigation(WrappedComponent) {
    const WithNavigation = (props) => {
        const navigation = useNavigation();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                navigation={navigation}
            />
        );
    };

    WithNavigation.displayName = `withNavigation(${getComponentDisplayName(WrappedComponent)})`;
    WithNavigation.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithNavigation.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithNavigation {...props} forwardedRef={ref} />
    ));
}

export {
    withNavigationPropTypes,
};
