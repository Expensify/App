import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';

import type {PropsWithChildren} from 'react';
import type {ViewStyle} from 'react-native';

import React, {useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';

// Keeps children painted while React hides the surrounding subtree. React hides the content of a hidden
// <Activity> (and of a suspended tree) by setting an inline 'display: none !important' on its nearest host
// elements. No stylesheet rule can win against that, so a MutationObserver forces 'display: contents' back with
// the same priority whenever the inline style changes. As a result the navigator's card visibility, not Activity,
// decides what is visible on screen - the web counterpart of the native view config trick in index.native.tsx.
function CustomViewWrapper({style, children}: PropsWithChildren<{style: ViewStyle}>) {
    const ref = useRef<View>(null);

    useLayoutEffect(() => {
        const element = htmlDivElementRef(ref).current;
        if (!element) {
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
        return () => observer.disconnect();
    }, []);

    return (
        <View
            ref={ref}
            style={style}
        >
            {children}
        </View>
    );
}

export default CustomViewWrapper;
