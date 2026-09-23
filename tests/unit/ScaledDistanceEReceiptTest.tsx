import {fireEvent, render, screen} from '@testing-library/react-native';

import ScaledDistanceEReceipt from '@components/ScaledDistanceEReceipt';

import variables from '@styles/variables';

import type ReactNative from 'react-native';

import React from 'react';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Jest runs no layout engine, so the blank receipt on native (#99376) can only be seen on a device. What can be tested
// here is the part that caused it and the arithmetic built on it: the scaler has to ask the card for its natural height,
// and the scale has to follow from the space offered and the height the card measures.
jest.mock('@components/DistanceEReceipt', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    function MockDistanceEReceipt({shouldUseNaturalHeight}: {shouldUseNaturalHeight?: boolean}) {
        return MockReact.createElement(View, {testID: shouldUseNaturalHeight ? 'distance-e-receipt-natural-height' : 'distance-e-receipt'});
    }
    return {
        __esModule: true,
        default: MockDistanceEReceipt,
    };
});

function layOut(testID: string, width: number, height: number) {
    fireEvent(screen.getByTestId(testID), 'onLayout', {
        nativeEvent: {layout: {x: 0, y: 0, width, height}},
    });
}

// Math.min returns one of its arguments unchanged, so the expected ratios below are the exact values the component computes
function expectScale(scale: number) {
    expect(screen.getByTestId('scaled-distance-e-receipt-card')).toHaveStyle({transform: [{scale}]});
}

async function renderScaled({box, cardHeight}: {box?: {width: number; height: number}; cardHeight?: number} = {}) {
    render(<ScaledDistanceEReceipt transaction={createRandomTransaction(0)} />);
    if (box) {
        layOut('scaled-distance-e-receipt', box.width, box.height);
    }
    if (cardHeight !== undefined) {
        layOut('scaled-distance-e-receipt-card', variables.eReceiptHoverCardWidth, cardHeight);
    }
    await waitForBatchedUpdatesWithAct();
}

describe('ScaledDistanceEReceipt', () => {
    it('asks the card for its natural height, which is what it measures and scales', async () => {
        await renderScaled();
        expect(screen.getByTestId('distance-e-receipt-natural-height')).toBeTruthy();
        expect(screen.queryByTestId('distance-e-receipt')).toBeNull();
    });

    it('draws the card at its own size until both the box and the card have been measured', async () => {
        await renderScaled();
        expectScale(1);

        layOut('scaled-distance-e-receipt', 900, 740);
        await waitForBatchedUpdatesWithAct();
        expectScale(1);
    });

    it('scales a short card up to fill a large box, bounded by the height', async () => {
        await renderScaled({box: {width: 900, height: 740}, cardHeight: 392});
        expectScale(740 / 392);
    });

    it('scales a card taller than the box down so the whole receipt fits', async () => {
        await renderScaled({box: {width: 386, height: 700}, cardHeight: 972});
        expectScale(700 / 972);
    });

    it('is bounded by the width when the box is narrow', async () => {
        await renderScaled({box: {width: 400, height: 2000}, cardHeight: 300});
        expectScale(400 / variables.eReceiptHoverCardWidth);
    });

    it('never scales past three times the card size', async () => {
        await renderScaled({box: {width: 3000, height: 3000}, cardHeight: 300});
        expectScale(3);
    });
});
