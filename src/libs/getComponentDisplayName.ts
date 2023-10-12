import {ComponentType} from 'react';

/** Returns the display name of a component */
export default function getComponentDisplayName(component: ComponentType): string {
    return component.displayName ?? component.name ?? 'Component';
}
