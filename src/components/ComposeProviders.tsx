import React, {ComponentType, ReactNode} from 'react';
import ChildrenProps from '../types/utils/ChildrenProps';

type ComposeProvidersProps = ChildrenProps & {
    /** Provider components go here */
    components: Array<ComponentType<ChildrenProps>>;
};

function ComposeProviders(props: ComposeProvidersProps): ReactNode {
    return props.components.reduceRight((memo, Component) => <Component>{memo}</Component>, props.children);
}

ComposeProviders.displayName = 'ComposeProviders';
export default ComposeProviders;
