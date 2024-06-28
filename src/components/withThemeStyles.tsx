import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {ThemeStyles} from '@styles/index';

type WithThemeStylesProps = {themeStyles: ThemeStyles};

export default function withThemeStyles<TProps extends WithThemeStylesProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof WithThemeStylesProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithThemeStyles(props: Omit<TProps, keyof WithThemeStylesProps>, ref: ForwardedRef<TRef>): ReactElement {
        const themeStyles = useThemeStyles();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                themeStyles={themeStyles}
                ref={ref}
            />
        );
    }

    WithThemeStyles.displayName = `withThemeStyles(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithThemeStyles);
}

export type {WithThemeStylesProps};
