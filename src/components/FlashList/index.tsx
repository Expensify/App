import KeyboardDismissibleFlashList from '@components/KeyboardDismissibleFlashList';

import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';

import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {FlashList as ShopifyFlashList} from '@shopify/flash-list';
import React from 'react';

import type {CustomFlashListProps} from './types';

function FlashList<T>({enableAnimatedKeyboardDismissal, onScroll: onScrollProp, inverted, ...restProps}: CustomFlashListProps<T>) {
    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true, inverted});

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScrollProp?.(e);
        // Emit scroll events so that ActiveHoverable can suppress hover effects during scroll
        emitComposerScrollEvents();
    };

    if (enableAnimatedKeyboardDismissal) {
        return (
            <KeyboardDismissibleFlashList
                {...restProps}
                inverted={inverted}
                // Composer scroll events are emitted in `KeyboardDismissibleFlatList` separately, therefore we pass the `onScroll` prop instead of the `handleScroll` callback.
                onScroll={onScrollProp}
            />
        );
    }

    return (
        <ShopifyFlashList<T>
            {...restProps}
            inverted={inverted}
            onScroll={handleScroll}
        />
    );
}

export default FlashList;
