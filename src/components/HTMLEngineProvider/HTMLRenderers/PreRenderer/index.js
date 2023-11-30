import React, {useCallback, useEffect, useRef} from 'react';
import _ from 'underscore';
import htmlRendererPropTypes from '@components/HTMLEngineProvider/HTMLRenderers/htmlRendererPropTypes';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BasePreRenderer from './BasePreRenderer';

const supportsPassive = DeviceCapabilities.hasPassiveEventListenerSupport();

const isScrollingVertically = (event) =>
    // Mark as vertical scrolling only when absolute value of deltaY is more than the double of absolute
    // value of deltaX, so user can use trackpad scroll on the code block horizontally at a wide angle.
    Math.abs(event.deltaY) > Math.abs(event.deltaX) * 2;

const debouncedIsScrollingVertically = _.debounce(isScrollingVertically, 100, true);

function PreRenderer(props) {
    const scrollViewRef = useRef();

    /**
     * Checks if user is scrolling vertically based on deltaX and deltaY. We debounce this
     * method in order to make sure it's called only for the first event.
     * @param {WheelEvent} event Wheel event
     * @returns {Boolean} true if user is scrolling vertically
     */

    /**
     * Manually scrolls the code block if code block horizontal scrollable, then prevents the event from being passed up to the parent.
     * @param {Object} event native event
     */
    const scrollNode = useCallback((event) => {
        const node = scrollViewRef.current.getScrollableNode();
        const horizontalOverflow = node.scrollWidth > node.offsetWidth;
        if (event.currentTarget === node && horizontalOverflow && !debouncedIsScrollingVertically(event)) {
            node.scrollLeft += event.deltaX;
        }
    }, []);

    useEffect(() => {
        const eventListenerRefValue = scrollViewRef.current;
        if (!eventListenerRefValue) {
            return;
        }
        eventListenerRefValue.getScrollableNode().addEventListener('wheel', scrollNode, supportsPassive ? {passive: true} : false);

        return () => {
            if (!eventListenerRefValue.getScrollableNode()) {
                return;
            }
            eventListenerRefValue.getScrollableNode().removeEventListener('wheel', scrollNode);
        };
    }, [scrollNode]);

    return (
        <BasePreRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={scrollViewRef}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={ControlSelection.unblock}
        />
    );
}

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default PreRenderer;
