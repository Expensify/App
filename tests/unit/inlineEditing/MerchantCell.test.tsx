// Covers the editable Markdown buffer separately from the table's plain-text preview.
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type useInlineEditState from '@components/EditableCell/useInlineEditState';
import MerchantOrDescriptionCell from '@components/TransactionItemRow/DataCells/MerchantCell';

import useKeyboardShortcut from '@hooks/useKeyboardShortcut';

import type {TextInputProps} from 'react-native';

import React from 'react';

type MockNativeComponents = {
    TouchableOpacity: React.ComponentType<{accessibilityRole: string; onPress: () => void; children: React.ReactNode}>;
    TextInput: React.ComponentType<TextInputProps>;
    Text: React.ComponentType<{children: string}>;
};

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());
jest.mock('@components/EditableCell', () => {
    const {TouchableOpacity} = jest.requireActual<MockNativeComponents>('react-native');
    return {
        useInlineEditState: jest.requireActual<{default: typeof useInlineEditState}>('@components/EditableCell/useInlineEditState').default,
        EditableCell: ({isEditing, editContent, onStartEditing, children}: {isEditing: boolean; editContent: React.ReactNode; onStartEditing: () => void; children: React.ReactNode}) =>
            isEditing ? (
                editContent
            ) : (
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={onStartEditing}
                >
                    {children}
                </TouchableOpacity>
            ),
    };
});
jest.mock('@components/TextInput', () => {
    const {TextInput} = jest.requireActual<MockNativeComponents>('react-native');
    return (props: TextInputProps) => <TextInput {...props} />;
});
jest.mock('@components/TextWithTooltip', () => {
    const {Text} = jest.requireActual<MockNativeComponents>('react-native');
    return ({text}: {text: string}) => <Text>{text}</Text>;
});

const description = 'Client dinner with <strong>Acme Corp</strong><br />Attendees: John, Sarah';
const markdown = 'Client dinner with *Acme Corp*\nAttendees: John, Sarah';
const preview = 'Client dinner with Acme Corp Attendees: John, Sarah';

describe('MerchantOrDescriptionCell', () => {
    it('edits and saves Markdown with line breaks while displaying plain text', () => {
        // Given a formatted, multiline description in a collapsed table cell
        const onSave = jest.fn();
        render(
            <MerchantOrDescriptionCell
                merchantOrDescription={description}
                shouldShowTooltip={false}
                isDescription
                canEdit
                onSave={onSave}
            />,
        );
        expect(screen.getByText(preview)).toBeTruthy();

        // When the user opens it, appends punctuation and submits
        fireEvent.press(screen.getByText(preview));
        const input = screen.getByLabelText('common.description');
        expect(input.props.value).toBe(markdown);
        fireEvent.changeText(input, `${markdown}!`);
        fireEvent(input, 'submitEditing');

        // Then saving keeps both the formatting markers and the newline
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith(`${markdown}!`);
        expect(screen.getByText(preview)).toBeTruthy();
    });

    it('does not save an unchanged description on blur', () => {
        // Given a description whose display text differs from its Markdown
        const onSave = jest.fn();
        render(
            <MerchantOrDescriptionCell
                merchantOrDescription={description}
                shouldShowTooltip={false}
                isDescription
                canEdit
                onSave={onSave}
            />,
        );

        // When editing ends without a change
        fireEvent.press(screen.getByText(preview));
        fireEvent(screen.getByLabelText('common.description'), 'blur');

        // Then the HTML is not overwritten or needlessly saved
        expect(onSave).not.toHaveBeenCalled();
        expect(screen.getByText(preview)).toBeTruthy();
    });

    it('cancels a multiline paste with Escape and restores the original Markdown', () => {
        // Given an open description editor
        const onSave = jest.fn();
        render(
            <MerchantOrDescriptionCell
                merchantOrDescription={description}
                shouldShowTooltip={false}
                isDescription
                canEdit
                onSave={onSave}
            />,
        );
        fireEvent.press(screen.getByText(preview));

        // When multiline text is pasted and Escape is pressed
        const pasted = `${markdown}\nNew *attendee*`;
        fireEvent.changeText(screen.getByLabelText('common.description'), pasted);
        expect(screen.getByLabelText('common.description').props.value).toBe(pasted);
        const escapeHandler = jest.mocked(useKeyboardShortcut).mock.lastCall?.[1];
        act(() => escapeHandler?.());

        // Then cancellation makes no save and reopening restores the original Markdown
        expect(onSave).not.toHaveBeenCalled();
        fireEvent.press(screen.getByText(preview));
        expect(screen.getByLabelText('common.description').props.value).toBe(markdown);
    });

    it('continues flattening pasted merchant lines and trimming before saving', () => {
        // Given a merchant cell using the same component
        const onSave = jest.fn();
        render(
            <MerchantOrDescriptionCell
                merchantOrDescription="Cafe"
                shouldShowTooltip={false}
                canEdit
                onSave={onSave}
            />,
        );

        // When a merchant with line breaks and surrounding spaces is pasted and saved
        fireEvent.press(screen.getByText('Cafe'));
        const input = screen.getByLabelText('common.merchant');
        fireEvent.changeText(input, '  New\nCafe  ');
        fireEvent(input, 'submitEditing');

        // Then the existing single-line merchant normalization remains intact
        expect(onSave).toHaveBeenCalledWith('New Cafe');
    });
});
