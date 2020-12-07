/**
 * This is a higher order component that wraps an element in a pressable, and calls onSecondaryInteraction when that
 * pressable is long pressed.
 */
import React from 'react';
import {Pressable} from 'react-native';

/**
 * Returns the display name of a component
 *
 * @param {object} component
 * @returns {string}
 */
function getDisplayName(component) {
    return component.displayName || component.name || 'Component';
}

export default function (onSecondaryInteraction) {
    return (WrappedComponent) => {
        const withSecondaryInteractionHandler = props => (
            <Pressable
                onLongPress={onSecondaryInteraction}
            >
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </Pressable>
        );

        withSecondaryInteractionHandler.displayName = `withSecondaryInteractionHandler(${getDisplayName(WrappedComponent)})`;
        return withSecondaryInteractionHandler;
    };
}
