import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';

import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

/**
 * Keeps children painted while React hides the surrounding subtree. React hides the content of a hidden
 * <Activity> (and of a suspended tree) by setting an inline 'display: none !important' on its nearest host
 * elements. No stylesheet rule can win against that, so a MutationObserver forces 'display: contents' back with
 * the same priority whenever the inline style changes. As a result the navigator's card visibility, not Activity,
 * decides what is visible on screen - the web counterpart of the native view config trick in index.native.tsx.
 *
 * The observer must not live in an effect: a hidden Activity unmounts the effects of its subtree, so an effect
 * cleanup would disconnect the observer (discarding its pending records) in the very commit that applies the
 * display none. A callback ref attaches the observer once instead. It is deliberately never disconnected; after
 * unmount the observer and the element only reference each other, so both get garbage collected together.
 */
function CustomViewWrapper({style, children}: PropsWithChildren<{style: ViewStyle}>) {
    const observerRef = useRef<MutationObserver | null>(null);

    const attachDisplayContentsEnforcer = (node: View | null) => {
        if (!node || observerRef.current) {
            return;
        }

        const element = htmlDivElementRef({current: node}).current;
        if (!element || typeof MutationObserver === 'undefined') {
            return;
        }

        const forceDisplayContents = () => {
            if (element.style.getPropertyValue('display') === 'contents') {
                return;
            }
            element.style.setProperty('display', 'contents', 'important');
        };

        forceDisplayContents();
        const observer = new MutationObserver(forceDisplayContents);
        observer.observe(element, {attributes: true, attributeFilter: ['style']});
        observerRef.current = observer;
    };

    return (
        <View
            ref={attachDisplayContentsEnforcer}
            style={style}
        >
            {children}
        </View>
    );
}

export default CustomViewWrapper;
