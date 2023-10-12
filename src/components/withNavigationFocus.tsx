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

export default function withNavigationFocus<TProps extends WithNavigationFocusProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    function WithNavigationFocus(props: Omit<TProps, keyof WithNavigationFocusProps>, ref: ForwardedRef<TRef>) {
        const isFocused = useIsFocused();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                ref={ref}
                isFocused={isFocused}
            />
        );
    }

    WithNavigationFocus.displayName = `withNavigationFocus(${getComponentDisplayName(WrappedComponent as ComponentType)})`;
    return React.forwardRef(WithNavigationFocus);
}

export {withNavigationFocusPropTypes};
