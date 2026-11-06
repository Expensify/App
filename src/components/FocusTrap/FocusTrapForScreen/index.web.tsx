import FocusTrapExtraContainersContext from '@components/FocusTrap/FocusTrapExtraContainersContext';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {isCancellingDndKeyboardDrag} from '@libs/cancelDndKeyboardDrag';
import mergeRefs from '@libs/mergeRefs';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import sharedTrapStack from '@libs/sharedTrapStack';

import CONST from '@src/CONST';

import type {Ref} from 'react';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {FocusTrap} from 'focus-trap-react';
import React, {useContext, useState} from 'react';

import type FocusTrapProps from './FocusTrapProps';

function FocusTrapForScreen({children, focusTrapSettings}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const extraContainerElements = useContext(FocusTrapExtraContainersContext);
    const [screenElement, setScreenElement] = useState<HTMLElement | null>(null);

    // Detaching passes null, which the trap's own child tracking already covers.
    const [captureScreenElement] = useState(() => (element: HTMLElement | null) => {
        if (!element) {
            return;
        }

        setScreenElement(element);
    });

    // Focus trap can't be active on sidebar screens because it would block access to the tab bar.
    // in top tabs only focus trap for currently shown tab should be active
    // Focus trap can't be active on these screens if the layout is wide because they may be displayed side by side.
    let isActive;
    if (typeof focusTrapSettings?.active !== 'undefined') {
        isActive = focusTrapSettings.active;
    } else {
        isActive =
            !isSidebarScreenName(route.name) &&
            (TOP_TAB_SCREENS.find((screen) => screen === route.name) ? isFocused : !(WIDE_LAYOUT_INACTIVE_SCREENS.includes(route.name) && !shouldUseNarrowLayout) && isFocused);
    }

    const customContainerElements = focusTrapSettings?.containerElements?.length ? focusTrapSettings.containerElements : undefined;
    let containerElements = customContainerElements && extraContainerElements.length > 0 ? [...customContainerElements, ...extraContainerElements] : customContainerElements;
    let trappedChildren = children;

    // Passing containers replaces the trap's own child, so the screen is listed along with the extra elements.
    // Once listed it stays listed: dropping back to no containers would leave the trap with none, since it only reads its child on creation.
    const child = !customContainerElements && (extraContainerElements.length > 0 || screenElement) ? React.Children.only(children) : undefined;
    if (React.isValidElement<{ref?: Ref<HTMLElement>}>(child)) {
        trappedChildren = React.cloneElement(child, {ref: mergeRefs(child.props.ref, captureScreenElement)});
        containerElements = screenElement ? [screenElement, ...extraContainerElements] : undefined;
    }

    return (
        <FocusTrap
            active={isActive}
            paused={!isFocused}
            containerElements={containerElements}
            focusTrapOptions={{
                onActivate: () => {
                    const activeElement = document?.activeElement as HTMLElement;
                    if (activeElement?.nodeName === CONST.ELEMENT_NAME.INPUT || activeElement?.nodeName === CONST.ELEMENT_NAME.TEXTAREA) {
                        return;
                    }
                    activeElement?.blur();
                },
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                // Clicking outside should break the trap so side panel can remain interactive.
                clickOutsideDeactivates: true,
                // Synthetic Escape events dispatched by cancelDndKeyboardDrag are only
                // meant for the dnd-kit KeyboardSensor. Ignore them so the trap stays active.
                escapeDeactivates: () => !isCancellingDndKeyboardDrag(),
                fallbackFocus: document.body,
                delayInitialFocus: CONST.ANIMATED_TRANSITION,
                initialFocus: false,
                setReturnFocus: false,
                ...(focusTrapSettings?.focusTrapOptions ?? {}),
            }}
        >
            {trappedChildren}
        </FocusTrap>
    );
}

export default FocusTrapForScreen;
