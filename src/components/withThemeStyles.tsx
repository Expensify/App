import PropTypes from 'prop-types';
import React, {ComponentType, ForwardedRef, forwardRef, ReactElement, RefAttributes} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import styles from '@styles/styles';
import useThemeStyles from '@styles/useThemeStyles';

const withThemeStylesPropTypes = {
    themeStyles: PropTypes.object.isRequired,
};
type ThemeStylesProps = {themeStyles: typeof styles};

export default function withThemeStyles<TProps extends ThemeStylesProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof ThemeStylesProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithThemeStyles(props: Omit<TProps, keyof ThemeStylesProps>, ref: ForwardedRef<TRef>): ReactElement {
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

export {withThemeStylesPropTypes};
