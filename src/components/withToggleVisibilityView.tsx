import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import getComponentDisplayName from '../libs/getComponentDisplayName';

type ToggleVisibilityViewPropTypes = {
    /** Whether the content is visible. */
    isVisible: boolean;
};

export default function withToggleVisibilityView<TProps extends ToggleVisibilityViewPropTypes, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): ComponentType<TProps> {
    function WithToggleVisibilityView(props: Omit<TProps, keyof ToggleVisibilityViewPropTypes>, ref: ForwardedRef<TRef>) {
        return (
            <View style={!((props as TProps)?.isVisible ?? false) && styles.visuallyHidden}>
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(props as TProps)}
                    ref={ref}
                    isVisible={(props as TProps).isVisible ?? false}
                />
            </View>
        );
    }

    WithToggleVisibilityView.displayName = `WithToggleVisibilityView(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef(WithToggleVisibilityView);
}
