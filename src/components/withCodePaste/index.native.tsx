import {ComponentType, forwardRef, ReactElement, RefAttributes} from 'react';

function withCodePaste<TProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): (props: TProps & RefAttributes<TRef>) => ReactElement | null {
    return forwardRef((props, ref) => (
        <WrappedComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    ));
}
export default withCodePaste;
