import useThemeStyles from '@hooks/useThemeStyles';

import getComponentDisplayName from '@libs/getComponentDisplayName';

import type {ComponentType} from 'react';

import React from 'react';
import {View} from 'react-native';

type WithToggleVisibilityViewProps = {
    /** Whether the content is visible. */
    isVisible?: boolean;
};

export default function withToggleVisibilityView<TProps>(WrappedComponent: ComponentType<TProps>): ComponentType<TProps & WithToggleVisibilityViewProps> {
    function WithToggleVisibilityView({isVisible = false, ...rest}: WithToggleVisibilityViewProps) {
        const styles = useThemeStyles();
        return (
            <View
                style={!isVisible && styles.visuallyHidden}
                collapsable={false}
            >
                <WrappedComponent
                    {...(rest as TProps)}
                    isVisible={isVisible}
                />
            </View>
        );
    }

    WithToggleVisibilityView.displayName = `WithToggleVisibilityViewWithRef(${getComponentDisplayName(WrappedComponent)})`;

    return React.memo(WithToggleVisibilityView);
}

export type {WithToggleVisibilityViewProps};
