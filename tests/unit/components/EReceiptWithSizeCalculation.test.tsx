import {fireEvent, render} from '@testing-library/react-native';

import EReceipt from '@components/EReceipt';
import EReceiptWithSizeCalculation from '@components/EReceiptWithSizeCalculation';
import PerDiemEReceipt from '@components/PerDiemEReceipt';

import variables from '@styles/variables';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type TranslateZ0Style from '../../../src/styles/utils/translateZ0/type';

const webTranslateZ0 = jest.requireActual<{default: TranslateZ0Style}>('../../../src/styles/utils/translateZ0/index.ts').default;
const nativeTranslateZ0 = jest.requireActual<{default: TranslateZ0Style}>('../../../src/styles/utils/translateZ0/index.native.ts').default;

let mockTransform: ViewStyle['transform'] = webTranslateZ0.translateZ0.transform;
jest.mock('@hooks/useThemeStyles', () => () => ({
    overflowHidden: {overflow: 'hidden'},
    w100: {width: '100%'},
    h100: {height: '100%'},
    userSelectNone: {},
    translateZ0: {transform: mockTransform},
}));
jest.mock('@components/EReceipt', () => jest.fn(() => null));
jest.mock('@components/PerDiemEReceipt', () => jest.fn(() => null));
describe('EReceiptWithSizeCalculation', () => {
    beforeEach(() => jest.clearAllMocks());
    it.each([
        {
            platform: 'web',
            transform: webTranslateZ0.translateZ0.transform,
            expectedTransform: 'scale(0.5) translateZ(0)',
        },
        {
            platform: 'native',
            transform: nativeTranslateZ0.translateZ0.transform,
            expectedTransform: 'scale(0.5) ',
        },
    ])('keeps the exact $platform transform producer after layout', ({transform, expectedTransform}) => {
        // Given the real platform transform producer and an initially unknown width
        mockTransform = transform;
        const {UNSAFE_getByType: getByType, UNSAFE_getAllByType: getAllByType} = render(
            React.createElement(EReceiptWithSizeCalculation, {
                transactionID: 'transaction',
                shouldUseAspectRatio: true,
            }),
        );
        // When the placeholder reports a usable width
        fireEvent(getByType(View), 'layout', {
            nativeEvent: {layout: {width: variables.eReceiptBGHWidth / 2}},
        });
        // Then the receipt uses the same interpolated transform and aspect ratio
        expect(EReceipt).toHaveBeenCalled();
        const scaledView = getAllByType(View).find((node) => node.props.onLayout);
        expect(scaledView?.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    transform: expectedTransform,
                    transformOrigin: 'top left',
                }),
            ]),
        );
        expect(scaledView?.props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    aspectRatio: variables.eReceiptBGHWidth / variables.eReceiptBGHeight,
                }),
            ]),
        );
    });
    it('keeps the placeholder on zero width and rejects per diem without an ID', () => {
        // Given a layout without width and a separate incomplete per diem receipt
        const {UNSAFE_getByType: getByType} = render(<EReceiptWithSizeCalculation transactionID="transaction" />);
        // When the layout reports zero width
        fireEvent(getByType(View), 'layout', {
            nativeEvent: {layout: {width: 0}},
        });
        // Then there is still no selected receipt
        expect(EReceipt).not.toHaveBeenCalled();
        const incomplete = render(
            React.createElement(EReceiptWithSizeCalculation, {
                receiptType: 'perDiem',
                transactionID: undefined,
            }),
        );
        expect(incomplete.toJSON()).toBeNull();
    });
    it('uses an empty suffix for an unsupported non-string transform', () => {
        // Given a value admitted by the broad style type but not emitted by either producer
        mockTransform = [{translateX: 0}];
        const {UNSAFE_getByType: getByType, UNSAFE_getAllByType: getAllByType} = render(<EReceiptWithSizeCalculation transactionID="transaction" />);
        // When the placeholder receives its layout
        fireEvent(getByType(View), 'layout', {
            nativeEvent: {layout: {width: variables.eReceiptBGHWidth}},
        });
        // Then the defensive suffix does not stringify the object
        const scaledView = getAllByType(View).find((node) => node.props.onLayout);
        expect(scaledView?.props.style).toEqual(expect.arrayContaining([expect.objectContaining({transform: 'scale(1) '})]));
    });
    it('selects the per diem receipt after layout', () => {
        // Given a per diem transaction with an ID
        const {UNSAFE_getByType: getByType} = render(
            React.createElement(EReceiptWithSizeCalculation, {
                receiptType: 'perDiem',
                transactionID: 'transaction',
            }),
        );
        // When its width is measured
        fireEvent(getByType(View), 'layout', {
            nativeEvent: {layout: {width: variables.eReceiptBGHWidth}},
        });
        // Then the dedicated receipt is selected
        expect(PerDiemEReceipt).toHaveBeenCalled();
        expect(EReceipt).not.toHaveBeenCalled();
    });
});
