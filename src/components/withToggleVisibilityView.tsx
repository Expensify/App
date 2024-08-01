import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React from 'react';
import {View} from 'react-native';
import type {SetOptional} from 'type-fest';
import useThemeStyles from '@hooks/useThemeStyles';
import getComponentDisplayName from '@libs/getComponentDisplayName';

type WithToggleVisibilityViewProps = {
    /** Whether the content is visible. */
    isVisible: boolean;
};

export default function withToggleVisibilityView<TProps extends WithToggleVisibilityViewProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: TProps & RefAttributes<TRef>) => ReactElement | null {
    function WithToggleVisibilityView({isVisible = false, ...rest}: SetOptional<TProps, 'isVisible'>, ref: ForwardedRef<TRef>) {
        const styles = useThemeStyles();
        return (
            <View
                style={!isVisible && styles.visuallyHidden}
                collapsable={false}
            >
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

export type {WithToggleVisibilityViewProps};
