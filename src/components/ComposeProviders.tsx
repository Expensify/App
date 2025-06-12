import type {ComponentType, ReactNode} from 'react';
import React from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type ComposeProvidersProps = ChildrenProps & {
    /** Provider components go here */
    components: Array<ComponentType<ChildrenProps>>;
};

function ComposeProviders(props: ComposeProvidersProps): ReactNode {
    return props.components.reduceRight((children, Provider) => <Provider>{children}</Provider>, props.children as ReactNode);
}

ComposeProviders.displayName = 'ComposeProviders';
export default ComposeProviders;
