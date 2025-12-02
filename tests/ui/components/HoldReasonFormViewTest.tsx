import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import {translateLocal} from '../../utils/TestHelper';

jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', () => ({
    createNavigationContainerRef: jest.fn(),
    useIsFocused: () => true,
    useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn(), goBack: jest.fn()}),
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
}));

describe('HoldReasonFormView', () => {
    const onSubmit = jest.fn();
    const validate = jest.fn();
    const backTo = '';

    it('renders singular copy when one expense is selected', () => {
        render(
            <LocaleContextProvider>
                <HoldReasonFormView
                    onSubmit={onSubmit}
                    validate={validate}
                    backTo={backTo}
                    expenseCount={1}
                />
            </LocaleContextProvider>,
        );

        expect(screen.getByText(translateLocal('iou.explainHold', {count: 1}))).toBeTruthy();
        const holdExpenseElements = screen.getAllByText(translateLocal('iou.holdExpense', {count: 1}));
        expect(holdExpenseElements.length).toBeGreaterThanOrEqual(2); // Title and button
    });

    it('renders plural copy when multiple expenses are selected', () => {
        render(
            <LocaleContextProvider>
                <HoldReasonFormView
                    onSubmit={onSubmit}
                    validate={validate}
                    backTo={backTo}
                    expenseCount={2}
                />
            </LocaleContextProvider>,
        );

        expect(screen.getByText(translateLocal('iou.explainHold', {count: 2}))).toBeTruthy();
        const holdExpenseElements = screen.getAllByText(translateLocal('iou.holdExpense', {count: 2}));
        expect(holdExpenseElements.length).toBeGreaterThanOrEqual(2); // Title and button
    });
});
