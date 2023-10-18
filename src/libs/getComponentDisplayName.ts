import {ComponentType} from 'react';

/** Returns the display name of a component */
export default function getComponentDisplayName<TProps>(component: ComponentType<TProps>): string {
    return component.displayName ?? component.name ?? 'Component';
}
