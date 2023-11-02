import React, {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import {View} from 'react-native';
import {SetOptional} from 'type-fest';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import styles from '@styles/styles';

type ToggleVisibilityViewProps = {
    /** Whether the content is visible. */
    isVisible: boolean;
};

export default function withToggleVisibilityView<TProps extends ToggleVisibilityViewProps, TRef>(
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

    WithToggleVisibilityView.displayName = `WithToggleVisibilityViewWithRef(${getComponentDisplayName(WrappedComponent)})`;
    return React.forwardRef(WithToggleVisibilityView);
}
