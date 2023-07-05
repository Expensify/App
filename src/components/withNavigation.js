import React from 'react';
import PropTypes from 'prop-types';
import {useNavigation} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const withNavigationPropTypes = {
    navigation: PropTypes.object.isRequired,
};

export default function withNavigation(WrappedComponent) {
    function WithNavigation(props) {
        const navigation = useNavigation();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                navigation={navigation}
            />
        );
    }

    WithNavigation.displayName = `withNavigation(${getComponentDisplayName(WrappedComponent)})`;
    WithNavigation.propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
    };
    WithNavigation.defaultProps = {
        forwardedRef: () => {},
    };
    return React.forwardRef((props, ref) => (
        <WithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {withNavigationPropTypes};
