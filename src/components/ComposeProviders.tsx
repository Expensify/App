import React, {ComponentType, ReactNode} from 'react';

type ComponentProps = {
    children: ReactNode;
};

type ComposeProvidersProps = {
    /** Provider components go here */
    components: Array<ComponentType<ComponentProps>>;

    /** Rendered child component */
    children: ReactNode;
};

function ComposeProviders(props: ComposeProvidersProps): ReactNode {
    return props.components.reduceRight((memo, Component) => <Component>{memo}</Component>, props.children);
}

ComposeProviders.displayName = 'ComposeProviders';
export default ComposeProviders;
