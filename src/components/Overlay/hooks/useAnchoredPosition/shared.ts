import {useState, useSyncExternalStore} from 'react';
import type {LayoutChangeEvent, ViewStyle} from 'react-native';
import {Dimensions, I18nManager} from 'react-native';
import type {AnchorRect} from '@components/Overlay/libs/measureAnchor';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

let cachedViewport = Dimensions.get('window');
const moduleListeners = new Set<() => void>();

Dimensions.addEventListener('change', ({window}) => {
    if (window.width === cachedViewport.width && window.height === cachedViewport.height) {
        return;
    }
    cachedViewport = window;
    for (const listener of moduleListeners) {
        listener();
    }
});

function subscribeViewport(callback: () => void): () => void {
    moduleListeners.add(callback);
    return () => {
        moduleListeners.delete(callback);
    };
}

function getViewportSnapshot() {
    return cachedViewport;
}

type UseAnchoredPositionInput = {
    anchorRect: AnchorRect | null;
    alignment: AnchorAlignment;
    offsetPx?: number;
    gutterPx?: number;
};

type UseAnchoredPositionOutput = {
    style: ViewStyle;
    available: {height: number; width: number};
    isPositioned: boolean;
    onContentLayout: (event: LayoutChangeEvent) => void;
};

function useAnchoredPositionShared({anchorRect, alignment, offsetPx = 0, gutterPx = variables.gutterWidth}: UseAnchoredPositionInput): {
    edgeStyle: ViewStyle;
    available: {height: number; width: number};
    isPositioned: boolean;
    onContentLayout: (event: LayoutChangeEvent) => void;
} {
    const viewport = useSyncExternalStore(subscribeViewport, getViewportSnapshot);
    const [contentSize, setContentSize] = useState<{width: number; height: number} | null>(null);
    const [previousAnchorClosed, setPreviousAnchorClosed] = useState<boolean>(anchorRect === null);
    const isAnchorClosed = anchorRect === null;
    if (previousAnchorClosed !== isAnchorClosed) {
        setPreviousAnchorClosed(isAnchorClosed);
        if (isAnchorClosed) {
            setContentSize(null);
        }
    }

    const onContentLayout = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        if (contentSize?.width !== width || contentSize?.height !== height) {
            setContentSize({width, height});
        }
    };

    if (!anchorRect) {
        return {
            edgeStyle: {top: 0, left: 0, opacity: 0},
            available: {height: 0, width: 0},
            isPositioned: false,
            onContentLayout,
        };
    }

    const clampedTop = Math.max(0, Math.min(viewport.height, anchorRect.top));
    const clampedBottom = Math.max(0, Math.min(viewport.height, anchorRect.bottom));
    const clampedLeft = Math.max(0, Math.min(viewport.width, anchorRect.left));
    const clampedRight = Math.max(0, Math.min(viewport.width, anchorRect.right));
    const clampedWidth = Math.max(0, clampedRight - clampedLeft);

    const isVerticalCenter = alignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.CENTER;
    const requestedAbove = alignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM;
    const availableAbove = Math.max(0, clampedTop - offsetPx - gutterPx);
    const availableBelow = Math.max(0, viewport.height - clampedBottom - offsetPx - gutterPx);

    const isContentAbove = (() => {
        if (isVerticalCenter || !contentSize) {
            return requestedAbove;
        }
        const requestedRoom = requestedAbove ? availableAbove : availableBelow;
        if (requestedRoom >= contentSize.height) {
            return requestedAbove;
        }
        const oppositeRoom = requestedAbove ? availableBelow : availableAbove;
        return oppositeRoom > requestedRoom ? !requestedAbove : requestedAbove;
    })();

    const horizontalIntent = (() => {
        if (alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER) {
            return alignment.horizontal;
        }
        if (!I18nManager.isRTL) {
            return alignment.horizontal;
        }
        return alignment.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT;
    })();

    let verticalStyle: ViewStyle;
    let availableHeight: number;
    if (isVerticalCenter) {
        const centerY = (clampedTop + clampedBottom) / 2;
        let contentTop = contentSize ? centerY - contentSize.height / 2 : centerY;
        if (contentSize) {
            contentTop = Math.max(gutterPx, Math.min(contentTop, viewport.height - gutterPx - contentSize.height));
        }
        verticalStyle = {top: contentTop};
        availableHeight = Math.max(0, viewport.height - 2 * gutterPx);
    } else {
        verticalStyle = isContentAbove ? {bottom: viewport.height - clampedTop + offsetPx} : {top: clampedBottom + offsetPx};
        availableHeight = isContentAbove ? availableAbove : availableBelow;
    }

    let horizontalStyle: ViewStyle;

    if (horizontalIntent === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
        let contentLeft = clampedLeft;
        if (contentSize && contentLeft + contentSize.width > viewport.width - gutterPx) {
            contentLeft = Math.max(gutterPx, viewport.width - gutterPx - contentSize.width);
        }
        horizontalStyle = {left: contentLeft};
    } else if (horizontalIntent === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT) {
        let contentRight = viewport.width - clampedRight;
        if (contentSize && clampedRight - contentSize.width < gutterPx) {
            contentRight = Math.max(gutterPx, viewport.width - gutterPx - contentSize.width);
        }
        horizontalStyle = {right: contentRight};
    } else {
        const centerX = clampedLeft + clampedWidth / 2;
        let contentLeft = contentSize ? centerX - contentSize.width / 2 : centerX;
        if (contentSize) {
            contentLeft = Math.max(gutterPx, Math.min(contentLeft, viewport.width - gutterPx - contentSize.width));
        }
        horizontalStyle = {left: contentLeft};
    }

    // Intentionally content-independent (not the per-position room) so applying it as maxWidth can't feed back into measurement.
    const availableWidth = Math.max(0, viewport.width - 2 * gutterPx);

    return {
        edgeStyle: {...verticalStyle, ...horizontalStyle},
        available: {height: availableHeight, width: availableWidth},
        isPositioned: contentSize !== null,
        onContentLayout,
    };
}

export default useAnchoredPositionShared;
export type {UseAnchoredPositionInput, UseAnchoredPositionOutput};
