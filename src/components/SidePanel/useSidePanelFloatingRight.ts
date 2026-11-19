/** Where the floating side panel and its minimized launcher sit from the right window edge, beside any open RHP card. */
import {useWideRHPState} from '@components/WideRHPContextProvider';

import useOnyx from '@hooks/useOnyx';
import useSingleRHPWidth from '@hooks/useSingleRHPWidth';
import useWindowDimensions from '@hooks/useWindowDimensions';

import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import RHP_FLOATING_CARD_INSET from '@libs/Navigation/helpers/rhpFloatingCardInset';
import {getSingleRHPWidthStyleValue} from '@libs/Navigation/helpers/singleRHPWidth';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import type {DimensionValue} from 'react-native';

import {isRHPVisibleSelector} from '@selectors/Modal';

/**
 * Keeps an element of `elementWidth` left of an open RHP card, so the two never stack.
 * When the card leaves no room beside it, the element keeps the corner the RHP card's margin gives it.
 * `extraInset` moves the element further in from that edge.
 */
function useSidePanelFloatingRight(elementWidth: number, extraInset = 0): DimensionValue {
    const {windowWidth} = useWindowDimensions();
    const [isRHPVisible = false] = useOnyx(ONYXKEYS.MODAL, {selector: isRHPVisibleSelector});
    const {isWideRHPFocused, isSuperWideRHPFocused} = useWideRHPState();
    const {width: singleRHPWidth} = useSingleRHPWidth();

    const cornerRight = variables.rhpFloatingCardMargin + extraInset;
    if (!isRHPVisible) {
        return cornerRight;
    }

    let rhpWidth = singleRHPWidth;
    if (isSuperWideRHPFocused) {
        rhpWidth = calculateSuperWideRHPWidth(windowWidth);
    } else if (isWideRHPFocused) {
        rhpWidth = calculateWideRHPWidth(windowWidth);
    }

    const rhpLeftEdgeOffset = RHP_FLOATING_CARD_INSET + variables.rhpFloatingCardMargin + extraInset;
    if (windowWidth - rhpWidth - rhpLeftEdgeOffset < elementWidth + cornerRight) {
        return cornerRight;
    }

    // A single card's width follows its drag through a CSS variable, so the element tracks the card's edge mid-drag too.
    return isWideRHPFocused || isSuperWideRHPFocused ? rhpWidth + rhpLeftEdgeOffset : getSingleRHPWidthStyleValue(singleRHPWidth, rhpLeftEdgeOffset);
}

export default useSidePanelFloatingRight;
