import PropTypes from 'prop-types';
import React, {ComponentType, ForwardedRef, forwardRef, ReactElement, RefAttributes} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import {StyleUtilsWithoutThemeParameters} from '@styles/StyleUtils';
import useStyleUtils from '@styles/useThemeStyleUtils';

const withStyleUtilsPropTypes = {
    themeStyles: PropTypes.object.isRequired,
};
type WithStyleUtilsProps = {StyleUtils: StyleUtilsWithoutThemeParameters};

export default function withStyleUtils<TProps extends WithStyleUtilsProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof WithStyleUtilsProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithThemeStyles(props: Omit<TProps, keyof WithStyleUtilsProps>, ref: ForwardedRef<TRef>): ReactElement {
        const StyleUtils = useStyleUtils();
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
