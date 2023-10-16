import React, {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import {SetOptional} from 'type-fest';

type ToggleVisibilityViewProp = {
    /** Whether the content is visible. */
    isVisible: boolean;
};

export default function withToggleVisibilityView<TProps extends ToggleVisibilityViewProp, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: TProps & RefAttributes<TRef>) => ReactElement | null {
    function WithToggleVisibilityView({isVisible = false, ...rest}: SetOptional<TProps, 'isVisible'>, ref: ForwardedRef<TRef>) {
        return (
            <View style={!isVisible && styles.visuallyHidden}>
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(rest as TProps)}
                    ref={ref}
                    isVisible={isVisible}
                />
            </View>
        );
    }

    WithToggleVisibilityView.displayName = `WithToggleVisibilityView(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef(WithToggleVisibilityView);
}
