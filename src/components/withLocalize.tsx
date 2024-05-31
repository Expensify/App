import type {ComponentType, ForwardedRef, ReactElement, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {LocaleContextProps} from './LocaleContextProvider';
import {LocaleContext} from './LocaleContextProvider';

type WithLocalizeProps = LocaleContextProps;

export default function withLocalize<TProps extends WithLocalizeProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): (props: Omit<TProps, keyof LocaleContextProps> & React.RefAttributes<TRef>) => ReactElement | null {
    function WithLocalize(props: Omit<TProps, keyof WithLocalizeProps>, ref: ForwardedRef<TRef>) {
        return (
            <LocaleContext.Consumer>
                {(translateUtils) => (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...translateUtils}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(props as TProps)}
                        ref={ref}
                    />
                )}
            </LocaleContext.Consumer>
        );
    }

    WithLocalize.displayName = `withLocalize(${getComponentDisplayName(WrappedComponent)})`;
    return forwardRef(WithLocalize);
}

export type {WithLocalizeProps};
