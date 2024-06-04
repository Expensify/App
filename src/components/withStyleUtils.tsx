import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {StyleUtilsType} from '@styles/utils';

type WithStyleUtilsProps = {StyleUtils: StyleUtilsType};

export default function withStyleUtils<TProps extends WithStyleUtilsProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof WithStyleUtilsProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithStyleUtils(props: Omit<TProps, keyof WithStyleUtilsProps>, ref: ForwardedRef<TRef>): ReactElement {
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

    WithStyleUtils.displayName = `withStyleUtils(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithStyleUtils);
}

export type {WithStyleUtilsProps};
