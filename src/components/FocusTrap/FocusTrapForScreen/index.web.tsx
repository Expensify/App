import {useIsFocused, useRoute} from '@react-navigation/native';
import {FocusTrap} from 'focus-trap-react';
import React, {useMemo, useRef} from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import CONST from '@src/CONST';
import type FocusTrapProps from './FocusTrapProps';

/**
 * Checks if an element is focusable (visible, not disabled, and in the DOM).
 * This prevents attempting to focus elements that have been hidden or disabled
 * since they were captured.
 */
function isElementFocusable(element: Element | null): boolean {
    if (!element || !document.body.contains(element)) {
        return false;
    }

    // Check if element is hidden (display: none makes offsetParent null, except for body/html/fixed elements)
    // For fixed/absolute positioned elements, we check visibility and dimensions
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
    }

    // Check if element has zero dimensions (effectively hidden)
    // Only HTMLElement has offsetWidth/offsetHeight, SVGElement uses getBoundingClientRect
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
        return false;
    }

    // Check for disabled attribute (applies to buttons, inputs, etc.)
    if (element.hasAttribute('disabled')) {
        return false;
    }

    // Check for inert attribute (makes element and descendants non-interactive)
    if (element.hasAttribute('inert') || element.closest('[inert]')) {
        return false;
    }

    return true;
}

function FocusTrapForScreen({children, focusTrapSettings}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // Track if this trap was activated via navigation (not initial page load)
    // This is determined by whether a meaningful element was focused when the trap activated
    const wasActivatedViaNavigation = useRef(false);

    // Track the element that had focus before this trap activated
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    const isActive = useMemo(() => {
        if (typeof focusTrapSettings?.active !== 'undefined') {
            return focusTrapSettings.active;
        }
        // Focus trap can't be active on sidebar screens because it would block access to the tab bar.
        if (isSidebarScreenName(route.name)) {
            return false;
        }

        // in top tabs only focus trap for currently shown tab should be active
        if (TOP_TAB_SCREENS.find((screen) => screen === route.name)) {
            return isFocused;
        }

        // Focus trap can't be active on these screens if the layout is wide because they may be displayed side by side.
        if (WIDE_LAYOUT_INACTIVE_SCREENS.includes(route.name) && !shouldUseNarrowLayout) {
            return false;
        }
        return isFocused;
    }, [isFocused, shouldUseNarrowLayout, route.name, focusTrapSettings?.active]);

    return (
        <FocusTrap
            active={isActive}
            paused={!isFocused}
            containerElements={focusTrapSettings?.containerElements?.length ? focusTrapSettings.containerElements : undefined}
            focusTrapOptions={{
                onActivate: () => {
                    const activeElement = document?.activeElement as HTMLElement;

                    // Capture the currently focused element BEFORE blurring
                    // Only capture if it's a meaningful element (not body)
                    if (activeElement && activeElement !== document.body) {
                        previouslyFocusedElement.current = activeElement;
                        wasActivatedViaNavigation.current = true;
                    } else {
                        // Initial page load scenario - no meaningful element was focused
                        previouslyFocusedElement.current = null;
                        wasActivatedViaNavigation.current = false;
                    }

                    // Blur non-input elements as before
                    if (activeElement?.nodeName !== CONST.ELEMENT_NAME.INPUT && activeElement?.nodeName !== CONST.ELEMENT_NAME.TEXTAREA) {
                        activeElement?.blur();
                    }
                },
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                // Clicking outside should break the trap so side panel can remain interactive.
                clickOutsideDeactivates: true,
                fallbackFocus: document.body,
                delayInitialFocus: CONST.ANIMATED_TRANSITION,
                initialFocus: false,
                setReturnFocus: (triggerElement) => {
                    // Don't restore focus if this was an initial page load (not navigation)
                    // This guards against Issue #46109 (blue frame on new tab)
                    if (!wasActivatedViaNavigation.current) {
                        return false;
                    }

                    // If we have a previously focused element that is still focusable, use it
                    const elementToReturn = previouslyFocusedElement.current;

                    // Clear refs after use
                    previouslyFocusedElement.current = null;
                    wasActivatedViaNavigation.current = false;

                    // Check if element is still focusable (visible, not disabled, in DOM)
                    if (elementToReturn && isElementFocusable(elementToReturn)) {
                        return elementToReturn;
                    }

                    // Fallback: use the element provided by focus-trap if it's focusable
                    if (isElementFocusable(triggerElement)) {
                        return triggerElement;
                    }

                    // If neither element is focusable, don't attempt focus restoration
                    return false;
                },
                ...(focusTrapSettings?.focusTrapOptions ?? {}),
            }}
        >
            {children}
        </FocusTrap>
    );
}

export default FocusTrapForScreen;
