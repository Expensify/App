import {FlashList as ShopifyFlashList} from '@shopify/flash-list';
import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import React from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';

type FlashListPropsWithRef<T> = FlashListProps<T> & {ref?: React.Ref<FlashListRef<T>>};

function FlashList<T>({ref, onScroll: onScrollProp, inverted, ...restProps}: FlashListPropsWithRef<T>) {
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
            ref={ref}
            inverted={inverted}
            onScroll={handleScroll}
        />
    );
}

export default FlashList;
