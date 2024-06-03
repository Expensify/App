import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import useTheme from '@hooks/useTheme';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {ThemeColors} from '@styles/theme/types';

type WithThemeProps = {theme: ThemeColors};

export default function withTheme<TProps extends WithThemeProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof WithThemeProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithTheme(props: Omit<TProps, keyof WithThemeProps>, ref: ForwardedRef<TRef>): ReactElement {
        const theme = useTheme();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                theme={theme}
                ref={ref}
            />
        );
    }

    WithTheme.displayName = `withTheme(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithTheme);
}

export type {WithThemeProps};
