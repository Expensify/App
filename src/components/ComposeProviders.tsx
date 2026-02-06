import type {ComponentType, ReactNode} from 'react';
import React from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type ComposeProvidersProps = ChildrenProps & {
    /** Provider components go here */
    components: Array<ComponentType<ChildrenProps>>;
};

function ComposeProviders(props: ComposeProvidersProps): ReactNode {
    return props.components.reduceRight((memo, Component) => <Component>{memo}</Component>, props.children);
}

export default ComposeProviders;
