/** Verifies real footer branching and callbacks while replacing only its button and tooltip leaves. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import type {ButtonWithDropdownMenuProps} from '@components/ButtonWithDropdownMenu/types';
import ConfirmationFooterContent from '@components/MoneyRequestConfirmationList/ConfirmationFooterContent';
import type {ConfirmationFooterContentProps} from '@components/MoneyRequestConfirmationList/ConfirmationFooterContent';
import type SettlementButtonProps from '@components/SettlementButton/types';
import type EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type ReactNativeModule = require('react-native');

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

let dropdownProps: ButtonWithDropdownMenuProps<string> | undefined;
let settlementProps: SettlementButtonProps | undefined;
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@components/MoneyRequestConfirmationList/hooks/useReceiptTraining', () => () => ({shouldShowProductTrainingTooltip: false, renderProductTrainingTooltip: () => null}));
jest.mock(
    '@components/Tooltip/EducationalTooltip',
    () =>
        ({children}: Parameters<typeof EducationalTooltip>[0]) =>
            children,
);
jest.mock('@components/SettlementButton', () => {
    const {default: mockCONST} = jest.requireActual<{default: typeof CONST}>('@src/CONST');
    const {Pressable, Text} = jest.requireActual<typeof ReactNativeModule>('react-native');
    return (props: SettlementButtonProps) => {
        settlementProps = props;
        return (
            <Pressable
                accessibilityRole="button"
                testID="settlement"
                onPress={() => props.onPress({paymentType: mockCONST.IOU.PAYMENT_TYPE.ELSEWHERE})}
            >
                <Text>Settlement</Text>
            </Pressable>
        );
    };
});
jest.mock('@components/ButtonWithDropdownMenu', () => {
    const {Pressable, Text} = jest.requireActual<typeof ReactNativeModule>('react-native');
    return (props: ButtonWithDropdownMenuProps<string>) => {
        dropdownProps = props;
        return (
            <Pressable
                accessibilityRole="button"
                testID="confirmation-option"
                onPress={() => {
                    const option = props.options.at(0);
                    if (!option) {
                        throw new Error('Expected a confirmation option');
                    }
                    props.onPress(undefined, option.value);
                }}
            >
                <Text>{props.options.at(0)?.text}</Text>
            </Pressable>
        );
    };
});

const confirm = jest.fn<ReturnType<ConfirmationFooterContentProps['confirm']>, Parameters<ConfirmationFooterContentProps['confirm']>>();
const base: Omit<ConfirmationFooterContentProps, 'iouType'> = {
    confirm,
    iouCurrencyCode: 'USD',
    policyID: undefined,
    reportID: '100',
    isConfirmed: false,
    isConfirming: false,
    receiptOptions: {shouldDisplayReceipt: false},
    errorMessage: undefined,
    expensesNumber: 1,
    showRemoveExpenseConfirmModal: undefined,
    transaction: undefined,
    policy: undefined,
    iouAmount: 100,
    isTypeSplit: false,
    formattedAmount: '$1.00',
    isPerDiemRequest: false,
    isDistanceRequestWithPendingRoute: false,
};

describe('real canonical confirmation footer branches', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });
    beforeEach(async () => {
        confirm.mockClear();
        dropdownProps = undefined;
        settlementProps = undefined;
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('renders settlement only for PAY and forwards its payment callback', () => {
        // Given PAY is the exact existing settlement predicate.
        render(
            <ConfirmationFooterContent
                {...base}
                iouType={CONST.IOU.TYPE.PAY}
            />,
        );
        // When the settlement leaf delivers its normal payment action.
        fireEvent.press(screen.getByTestId('settlement'));
        // Then the actual footer selected settlement and forwarded the same payment type.
        expect(screen.queryByTestId('confirmation-option')).toBeNull();
        expect(settlementProps).toBeDefined();
        expect(settlementProps?.currency).toBe('USD');
        expect(settlementProps?.chatReportID).toBe('100');
        expect(confirm.mock.calls).toEqual([[{paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE}]]);
        expect(dropdownProps).toBeUndefined();
    });

    it.each([CONST.IOU.TYPE.SUBMIT, CONST.IOU.TYPE.TRACK])('keeps %s on the original dropdown fallback', (iouType) => {
        // Given canonical SUBMIT and TRACK are actual list/footer producers.
        render(
            <ConfirmationFooterContent
                {...base}
                iouType={iouType}
            />,
        );
        // When the real footer invokes the selected option callback.
        fireEvent.press(screen.getByTestId('confirmation-option'));
        // Then the actual option exists, preserves its value and routes through the original fallback callback.
        expect(screen.queryByTestId('settlement')).toBeNull();
        expect(dropdownProps).toBeDefined();
        expect(dropdownProps?.options).toHaveLength(1);
        const option = dropdownProps?.options.at(0);
        expect(option).toBeDefined();
        expect(option?.value).toBe(iouType);
        expect(dropdownProps?.sentryLabel).toBe(
            iouType === CONST.IOU.TYPE.TRACK ? CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_TRACK_BUTTON : CONST.SENTRY_LABEL.MONEY_REQUEST.CONFIRMATION_SUBMIT_BUTTON,
        );
        expect(confirm.mock.calls).toEqual([[{paymentType: iouType}]]);
        expect(settlementProps).toBeUndefined();
    });
});
