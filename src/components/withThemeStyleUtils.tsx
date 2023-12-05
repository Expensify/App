import PropTypes from 'prop-types';
import React, {ComponentType, ForwardedRef, forwardRef, ReactElement, RefAttributes} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import useThemeStyleUtils from '@styles/useThemeStyleUtils';
import {ThemeStyleUtilsType} from '@styles/utils/ThemeStyleUtils';

const withStyleUtilsPropTypes = {
    themeStyles: PropTypes.object.isRequired,
};
type WithStyleUtilsProps = {StyleUtils: ThemeStyleUtilsType};

export default function withThemeStyleUtils<TProps extends WithStyleUtilsProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof WithStyleUtilsProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithThemeStyles(props: Omit<TProps, keyof WithStyleUtilsProps>, ref: ForwardedRef<TRef>): ReactElement {
        const StyleUtils = useThemeStyleUtils();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                StyleUtils={StyleUtils}
                ref={ref}
            />
        );
    }

    WithThemeStyles.displayName = `withThemeStyles(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithThemeStyles);
}

export {withStyleUtilsPropTypes, type WithStyleUtilsProps};
