/**
 * This is a higher order component that wraps an element in a pressable, and calls onSecondaryInteraction when that
 * pressable is long pressed.
 */
import React from 'react';
import {Pressable} from 'react-native';

export default function (onSecondaryInteraction) {
    return (WrappedComponent) => {
        const withSecondaryInteractionHandler = (props) => {
            return (
                <Pressable
                    onLongPress={onSecondaryInteraction}
                >
                    <WrappedComponent
                        {...props}
                    />
                </Pressable>
            )
        };
        return withSecondaryInteractionHandler;
    };
};
