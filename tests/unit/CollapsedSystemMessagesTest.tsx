import {fireEvent, render, screen} from '@testing-library/react-native';

import CollapsedSystemMessages from '@pages/inbox/report/CollapsedSystemMessages';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        DownArrow: 'DownArrow',
        UpArrow: 'UpArrow',
    })),
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (_key: string, options?: {count?: number; isExpanded?: boolean}) => {
        const count = options?.count;
        if (count === undefined) {
            return 'New message line indicator';
        }
        return `${options?.isExpanded ? 'Hide' : 'Show'} ${count === 1 ? '1 action' : `${count} actions`}`;
    },
}));

describe('CollapsedSystemMessages', () => {
    it('renders a localized plural summary and expands accessibly', () => {
        const onPress = jest.fn();
        render(
            <CollapsedSystemMessages
                count={4}
                isExpanded={false}
                onPress={onPress}
            />,
        );

        const control = screen.getByRole('button', {name: 'Show 4 actions'});
        expect(control.props.accessibilityState).toMatchObject({expanded: false});

        fireEvent.press(control);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('uses singular grammar and exposes the collapsed action for an expanded run', () => {
        render(
            <CollapsedSystemMessages
                count={1}
                isExpanded
                onPress={jest.fn()}
            />,
        );

        expect(screen.getByRole('button', {name: 'Hide 1 action'}).props.accessibilityState).toMatchObject({expanded: true});
    });

    it('renders an unread marker for a member represented by the collapsed row', () => {
        render(
            <CollapsedSystemMessages
                count={2}
                isExpanded={false}
                onPress={jest.fn()}
                unreadMarkerReportActionID="unread-action"
            />,
        );

        expect(screen.getByLabelText('New message line indicator').props['data-action-id']).toBe('unread-action');
    });
});
