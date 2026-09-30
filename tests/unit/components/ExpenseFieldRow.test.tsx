import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import ExpenseFieldRow from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldRow';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const FIELD_NAME = 'Category';
const FIELD_VALUE = 'Travel';
const RIGHT_LABEL = 'Automatic';

// `MenuItem.Root` drops a press it was handed no event for, so every press here carries one.
const pressRow = () => fireEvent.press(screen.getByTestId('category-row'), {nativeEvent: {}});

describe('ExpenseFieldRow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('right label', () => {
        it('drops the label once the field holds a value', () => {
            // Given a row whose label answers "what goes here" rather than describing the value
            render(
                <ExpenseFieldRow
                    name={FIELD_NAME}
                    value={FIELD_VALUE}
                    rightLabel={RIGHT_LABEL}
                    shouldKeepRightLabelWhenFilled={false}
                    onPress={jest.fn()}
                />,
            );

            // When the field has a value
            // Then the label has said its piece and goes, the way `Required` does
            expect(screen.queryByText(RIGHT_LABEL)).toBeNull();
        });

        it('keeps the label when it describes the value the field holds', () => {
            // Given a row whose label describes the value itself, e.g. a category Concierge picked
            render(
                <ExpenseFieldRow
                    name={FIELD_NAME}
                    value={FIELD_VALUE}
                    rightLabel={RIGHT_LABEL}
                    shouldKeepRightLabelWhenFilled
                    onPress={jest.fn()}
                />,
            );

            // When the field has a value
            // Then the label survives it, or a field the app filled in would read as one the user chose
            expect(screen.getByText(RIGHT_LABEL)).toBeOnTheScreen();
        });

        it('shows the label while the field is empty', () => {
            // Given a row with no value yet
            render(
                <ExpenseFieldRow
                    name={FIELD_NAME}
                    rightLabel={RIGHT_LABEL}
                    onPress={jest.fn()}
                />,
            );

            // When the field is empty
            // Then the label is what tells the user the field still wants something
            expect(screen.getByText(RIGHT_LABEL)).toBeOnTheScreen();
        });
    });

    describe('press handling', () => {
        it('opens the selector for a signed-in user', () => {
            // Given a signed-in session
            const onPress = jest.fn();
            render(
                <ExpenseFieldRow
                    name={FIELD_NAME}
                    value={FIELD_VALUE}
                    onPress={onPress}
                    testID="category-row"
                />,
            );

            // When the row is pressed
            pressRow();

            // Then it opens the field's selector
            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('does not open the selector for an anonymous user', async () => {
            // Given an anonymous session, which every other `MenuItem` preset guards against
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            await waitForBatchedUpdates();

            const onPress = jest.fn();
            render(
                <ExpenseFieldRow
                    name={FIELD_NAME}
                    value={FIELD_VALUE}
                    onPress={onPress}
                    testID="category-row"
                />,
            );

            // When the row is pressed
            pressRow();

            // Then the sign-in prompt takes over instead of the field's selector
            expect(onPress).not.toHaveBeenCalled();
        });

        it('has no press handler at all when the field cannot be changed', () => {
            // Given a field nobody can change
            const onPress = jest.fn();
            render(
                <ExpenseFieldRow
                    name={FIELD_NAME}
                    value={FIELD_VALUE}
                    isInteractive={false}
                    onPress={onPress}
                    testID="category-row"
                />,
            );

            // When the row is pressed
            pressRow();

            // Then nothing opens, and the row is not offered as a control at all: a locked field stays one of the
            // form's fields, but reads as a disabled input rather than as something to tap
            expect(onPress).not.toHaveBeenCalled();
            expect(screen.queryByRole('button')).toBeNull();
        });
    });

    describe('read-only presentation', () => {
        it('renders a field the user cannot change as a disabled input', () => {
            const {result} = renderHook(() => useThemeStyles());

            // Given a field nobody can change
            render(
                <ExpenseFieldRow
                    name={FIELD_NAME}
                    value={FIELD_VALUE}
                    isInteractive={false}
                    onPress={jest.fn()}
                    testID="category-row"
                />,
            );

            // When the form renders it
            const row = screen.getByTestId('category-row');

            // Then it keeps the bordered container every other field on the form has, rather than dropping to a
            // borderless push row, and is greyed the way a disabled text input is
            expect(row).toHaveStyle({borderWidth: result.current.moneyRequestFieldRow.borderWidth});
            expect(row).toHaveStyle(result.current.moneyRequestFieldRowDisabled);
        });
    });
});
