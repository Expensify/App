import type {ComponentType, ReactElement} from 'react';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import getComponentDisplayName from '@libs/getComponentDisplayName';

type WithToggleVisibilityViewProps = {
    /** Whether the content is visible. */
    isVisible?: boolean;
};

export default function withToggleVisibilityView<TProps>(WrappedComponent: ComponentType<TProps>): (props: TProps & WithToggleVisibilityViewProps) => ReactElement | null {
    function WithToggleVisibilityView({isVisible = false, ...rest}: WithToggleVisibilityViewProps) {
        const styles = useThemeStyles();
        return (
            <View
                style={!isVisible && styles.visuallyHidden}
                collapsable={false}
            >
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(rest as TProps)}
                    isVisible={isVisible}
                />
            </View>
        );
    }

    WithToggleVisibilityView.displayName = `WithToggleVisibilityViewWithRef(${getComponentDisplayName(WrappedComponent)})`;

    return WithToggleVisibilityView;
}

export type {WithToggleVisibilityViewProps};
