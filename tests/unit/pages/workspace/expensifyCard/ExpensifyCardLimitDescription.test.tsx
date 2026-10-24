import {fireEvent, render, screen} from '@testing-library/react-native';

import ExpensifyCardLimitDescription from '@pages/workspace/expensifyCard/ExpensifyCardLimitDescription';

import React from 'react';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string, limit?: string) => {
        if (key === 'workspace.expensifyCard.bankAccountSuccessLimit') {
            return `The overall limit granted is ${limit}, but you can request a limit increase if needed.`;
        }
        return key;
    },
}));

jest.mock('@components/Popover', () => ({
    __esModule: true,
    default: ({isVisible, children}: {isVisible: boolean; children: React.ReactNode}) => (isVisible ? children : null),
}));

jest.mock('@components/Pressable', () => ({
    PressableWithFeedback: jest.requireActual<{Pressable: React.ComponentType}>('react-native').Pressable,
}));

describe('ExpensifyCardLimitDescription', () => {
    it('renders a formatted numeric limit without the reviewing popover', () => {
        // Given a feed whose US program has a limit of 4,500,000 cents
        // When the limit description renders
        render(
            <ExpensifyCardLimitDescription
                limit={4500000}
                formattedLimit="$45,000.00"
            />,
        );

        // Then the amount is shown in dollars, not raw cents
        expect(screen.getByText('The overall limit granted is $45,000.00, but you can request a limit increase if needed.')).toBeTruthy();
        expect(screen.queryByText('workspace.expensifyCard.bankAccountSuccessReviewingStatus')).toBeNull();
    });

    it('treats a zero limit as numeric rather than reviewing', () => {
        // Given the US program was assigned a limit of zero cents
        // When the limit description renders
        render(
            <ExpensifyCardLimitDescription
                limit={0}
                formattedLimit="$0.00"
            />,
        );

        // Then zero is displayed as a real limit rather than being treated as missing
        expect(screen.getByText('The overall limit granted is $0.00, but you can request a limit increase if needed.')).toBeTruthy();
        expect(screen.queryByText('workspace.expensifyCard.bankAccountSuccessReviewingStatus')).toBeNull();
    });

    it('renders reviewing for an unassigned limit and explains it when pressed', () => {
        // Given the underwriting team has not assigned a US limit
        // When the limit description renders and the reviewing status is pressed
        render(
            <ExpensifyCardLimitDescription
                limit={undefined}
                formattedLimit={undefined}
            />,
        );
        fireEvent.press(screen.getByRole('button', {name: 'workspace.expensifyCard.bankAccountSuccessReviewingStatus'}));

        // Then the reviewing status and its explanation are shown instead of a currency amount
        expect(screen.getByText('workspace.expensifyCard.bankAccountSuccessReviewingStatus')).toBeTruthy();
        expect(screen.getByText('workspace.expensifyCard.bankAccountSuccessReviewingExplanation')).toBeTruthy();
        expect(screen.queryByText(/\$0/)).toBeNull();
    });
});
