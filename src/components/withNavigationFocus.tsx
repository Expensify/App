import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import PropTypes from 'prop-types';
import {useIsFocused} from '@react-navigation/native';
import getComponentDisplayName from '../libs/getComponentDisplayName';

const withNavigationFocusPropTypes = {
    isFocused: PropTypes.bool.isRequired,
};

type WithNavigationFocusProps = {
    isFocused: boolean;
};

export default function withNavigationFocus<T extends WithNavigationFocusProps, R>(WrappedComponent: ComponentType<T & RefAttributes<R>>) {
    function WithNavigationFocus(props: Omit<T, keyof WithNavigationFocusProps>, ref: ForwardedRef<R>) {
        const isFocused = useIsFocused();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as T)}
                ref={ref}
                isFocused={isFocused}
            />
        );
    }

    WithNavigationFocus.displayName = `withNavigationFocus(${getComponentDisplayName(WrappedComponent as ComponentType)})`;
    return React.forwardRef(WithNavigationFocus);
}

export {withNavigationFocusPropTypes};
