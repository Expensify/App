import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';

import CONST from '@src/CONST';

import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';

/* eslint-disable @typescript-eslint/naming-convention -- Translation keys use dot-notation which violates naming conventions */
const translationMap: Record<string, string> = {
    newMessages: 'New messages',
    latestMessages: 'Latest messages',
    'common.actionBadge.submit': 'Submit',
    'common.actionBadge.approve': 'Approve',
    'common.actionBadge.pay': 'Pay',
    'common.actionBadge.fix': 'Fix',
    'accessibilityHints.scrollToActionBadgeTarget': 'Scroll to action requiring attention',
    'accessibilityHints.scrollToNewestMessages': 'Scroll to newest messages',
};
/* eslint-enable @typescript-eslint/naming-convention */

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => translationMap[key] ?? key),
        numberFormat: jest.fn((num: number) => num.toString()),
        toLocaleDigit: jest.fn((digit: string) => digit),
    })),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        DownArrow: () => null,
        UpArrow: () => null,
    }),
}));

describe('FloatingMessageCounter', () => {
    it('renders the new messages pill when hasNewMessages is true and no action badge', () => {
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages
                onClick={jest.fn()}
            />,
        );

        expect(screen.getByText('New messages')).toBeTruthy();
    });

    it('renders the latest messages pill when hasNewMessages is false and no action badge', () => {
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
            />,
        );

        expect(screen.getByText('Latest messages')).toBeTruthy();
    });

    it('renders the action badge pill instead of new messages pill when actionBadge and actionBadgeBrickRoadStatus are provided', () => {
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.APPROVE}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={jest.fn()}
            />,
        );

        expect(screen.getByText('Approve')).toBeTruthy();
        expect(screen.queryByText('New messages')).toBeNull();
    });

    it('renders the fix action badge with error brick road status', () => {
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.FIX}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                onActionBadgePress={jest.fn()}
            />,
        );

        expect(screen.getByText('Fix')).toBeTruthy();
        expect(screen.queryByText('Latest messages')).toBeNull();
    });

    it('calls onActionBadgePress when the action badge pill is pressed', () => {
        const onActionBadgePressMock = jest.fn();
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.PAY}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={onActionBadgePressMock}
            />,
        );

        fireEvent.press(screen.getByText('Pay'));
        expect(onActionBadgePressMock).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when the new messages pill is pressed', () => {
        const onClickMock = jest.fn();
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages
                onClick={onClickMock}
            />,
        );

        fireEvent.press(screen.getByText('New messages'));
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('renders submit action badge pill', () => {
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.SUBMIT}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={jest.fn()}
            />,
        );

        expect(screen.getByText('Submit')).toBeTruthy();
    });

    it('does not show action badge pill when only actionBadge is provided without actionBadgeBrickRoadStatus', () => {
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.APPROVE}
                onActionBadgePress={jest.fn()}
            />,
        );

        expect(screen.queryByText('Approve')).toBeNull();
        expect(screen.getByText('New messages')).toBeTruthy();
    });
});
