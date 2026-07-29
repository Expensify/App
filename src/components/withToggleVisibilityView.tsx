import useThemeStyles from '@hooks/useThemeStyles';

import getComponentDisplayName from '@libs/getComponentDisplayName';

import type {ComponentType} from 'react';

import React from 'react';
import {View} from 'react-native';

type WithToggleVisibilityViewProps = {
    /** Whether the content is visible. */
    isVisible?: boolean;
};

type WithToggleVisibilityViewImplProps<TProps> = {
    WrappedComponent: ComponentType<TProps>;
} & TProps &
    WithToggleVisibilityViewProps;

function WithToggleVisibilityViewImpl<TProps>({WrappedComponent, isVisible = false, ...rest}: WithToggleVisibilityViewImplProps<TProps>) {
    const styles = useThemeStyles();
    return (
        <View
            style={!isVisible && styles.visuallyHidden}
            collapsable={false}
        >
            <WrappedComponent
                {...(rest as unknown as TProps)}
                isVisible={isVisible}
            />
        </View>
    );
}

export default function withToggleVisibilityView<TProps>(WrappedComponent: ComponentType<TProps>): ComponentType<TProps & WithToggleVisibilityViewProps> {
    function WithToggleVisibilityView(props: TProps & WithToggleVisibilityViewProps) {
        return (
            <WithToggleVisibilityViewImpl
                WrappedComponent={WrappedComponent}
                {...props}
            />
        );
    }

    WithToggleVisibilityView.displayName = `WithToggleVisibilityViewWithRef(${getComponentDisplayName(WrappedComponent)})`;

    return WithToggleVisibilityView;
}

export type {WithToggleVisibilityViewProps};
