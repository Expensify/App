import {fireEvent, render, screen} from '@testing-library/react-native';

import CollapsedSystemMessages from '@pages/inbox/report/CollapsedSystemMessages';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';

const earliestReportAction: ReportAction = {reportActionID: 'oldest', actorAccountID: 1, created: '2026-09-17 12:00:00.000', actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE};
const mockHeader = jest.fn(({children}: {children: ReactNode}) => children);
jest.mock('@pages/inbox/report/ReportActionItemSingle', () => (props: {children: ReactNode}) => mockHeader(props));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        DownArrow: 'DownArrow',
    })),
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (_key: string, options?: {count?: number}) => {
        const count = options?.count;
        if (count === undefined) {
            return 'New message line indicator';
        }
        return `show ${count === 1 ? '1 update' : `${count} updates`}`;
    },
}));

describe('CollapsedSystemMessages', () => {
    it('renders a localized plural summary and expands accessibly', () => {
        const onPress = jest.fn();
        render(
            <CollapsedSystemMessages
                count={4}
                earliestReportAction={earliestReportAction}
                report={undefined}
                onPress={onPress}
            />,
        );

        const control = screen.getByRole('button', {name: 'show 4 updates'});
        expect(control.props.accessibilityState).toMatchObject({expanded: false});

        fireEvent.press(control);
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(mockHeader.mock.calls.at(-1)?.at(0)).toMatchObject({action: earliestReportAction});
    });

    it('renders an unread marker for a member represented by the collapsed row', () => {
        render(
            <CollapsedSystemMessages
                count={2}
                earliestReportAction={earliestReportAction}
                report={undefined}
                onPress={jest.fn()}
                unreadMarkerReportActionID="unread-action"
            />,
        );

        expect(screen.getByLabelText('New message line indicator').props['data-action-id']).toBe('unread-action');
    });
});
