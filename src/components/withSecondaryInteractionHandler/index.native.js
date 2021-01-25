/**
 * This is a higher order component that wraps an element in a pressable, and calls onSecondaryInteraction when that
 * pressable is long pressed.
 */
import React from 'react';
import {Pressable} from 'react-native';
import getComponentDisplayName from '../../libs/getComponentDisplayName';

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

        withSecondaryInteractionHandler
            .displayName = `withSecondaryInteractionHandler(${getComponentDisplayName(WrappedComponent)})`;
        return withSecondaryInteractionHandler;
    };
}
