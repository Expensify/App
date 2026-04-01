import {FlashList as ShopifyFlashList} from '@shopify/flash-list';
import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';

function FlashList<T>({onScroll: onScrollProp, inverted, ...restProps}: FlashListProps<T>) {
    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true, inverted});

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScrollProp?.(e);
        // Emit scroll events so that ActiveHoverable can suppress hover effects during scroll
        emitComposerScrollEvents();
    };

    return (
        <ShopifyFlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            inverted={inverted}
            onScroll={handleScroll}
        />
    );
}

export default FlashList;
