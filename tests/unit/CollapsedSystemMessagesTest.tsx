import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import CollapsedSystemMessages from '@components/MoneyRequestReportView/CollapsedSystemMessages';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        DownArrow: 'DownArrow',
        UpArrow: 'UpArrow',
    })),
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (_key: string, options?: {count?: number}) => {
        const count = options?.count;
        if (count === undefined) {
            return 'New message line indicator';
        }
        return count === 1 ? '1 action' : `${count} actions`;
    },
}));

describe('CollapsedSystemMessages', () => {
    it('renders a localized plural summary and expands accessibly', () => {
        const onPress = jest.fn();
        render(
            <LocaleContextProvider>
                <CollapsedSystemMessages
                    count={4}
                    isExpanded={false}
                    onPress={onPress}
                />
            </LocaleContextProvider>,
        );

        const control = screen.getByRole('button', {name: '4 actions'});
        expect(control.props.accessibilityState).toMatchObject({expanded: false});

        fireEvent.press(control);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('uses singular grammar and exposes the collapsed action for an expanded run', () => {
        render(
            <LocaleContextProvider>
                <CollapsedSystemMessages
                    count={1}
                    isExpanded
                    onPress={jest.fn()}
                />
            </LocaleContextProvider>,
        );

        expect(screen.getByRole('button', {name: '1 action'}).props.accessibilityState).toMatchObject({expanded: true});
    });

    it('renders an unread marker for a member represented by the collapsed row', () => {
        render(
            <LocaleContextProvider>
                <CollapsedSystemMessages
                    count={2}
                    isExpanded={false}
                    onPress={jest.fn()}
                    unreadMarkerReportActionID="unread-action"
                />
            </LocaleContextProvider>,
        );

        expect(screen.getByLabelText('New message line indicator').props['data-action-id']).toBe('unread-action');
    });
});
