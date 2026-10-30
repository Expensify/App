import {fireEvent, render, screen} from '@testing-library/react-native';

import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';

import CONST from '@src/CONST';

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

// The arrow icons render inside an accessibility-hidden wrapper, so record which one rendered to assert the pill direction
const mockRenderedArrows: string[] = [];
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        DownArrow: () => {
            mockRenderedArrows.push('DownArrow');
            return null;
        },
        UpArrow: () => {
            mockRenderedArrows.push('UpArrow');
            return null;
        },
    }),
}));

describe('FloatingMessageCounter', () => {
    beforeEach(() => {
        mockRenderedArrows.length = 0;
    });

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

    it('points the action badge pill up when the target is above the viewport', () => {
        // Given an action badge whose target is above the viewport
        render(
            <FloatingMessageCounter
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.APPROVE}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={jest.fn()}
            />,
        );

        // Then the pill points up, because the user has to scroll up to reach the target
        expect(screen.getByText('Approve')).toBeTruthy();
        expect(mockRenderedArrows).toContain('UpArrow');
        expect(mockRenderedArrows).not.toContain('DownArrow');
    });

    it('points the action badge pill down and scrolls to the target when the target is below the viewport', () => {
        // Given an action badge whose target is below the viewport while the user is scrolled up past the threshold
        const onActionBadgePressMock = jest.fn();
        render(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.APPROVE}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={onActionBadgePressMock}
                isActionBadgeTargetBelow
            />,
        );

        // When the pill is pressed
        fireEvent.press(screen.getByText('Approve'));

        // Then the pill points down toward the target and scrolls to it instead of to the latest messages
        expect(mockRenderedArrows).toContain('DownArrow');
        expect(mockRenderedArrows).not.toContain('UpArrow');
        expect(screen.queryByText('Latest messages')).toBeNull();
        expect(onActionBadgePressMock).toHaveBeenCalledTimes(1);
    });

    it('keeps the down arrow while the action badge pill slides out', () => {
        // Given the action badge pill points down at a target below the viewport
        const {rerender} = render(
            <FloatingMessageCounter
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.APPROVE}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={jest.fn()}
                isActionBadgeTargetBelow
            />,
        );
        mockRenderedArrows.length = 0;

        // When the target scrolls into view, so the list stops passing the badge and the below flag clears
        rerender(
            <FloatingMessageCounter
                hasNewMessages={false}
                onClick={jest.fn()}
                onActionBadgePress={jest.fn()}
                isActionBadgeTargetBelow={false}
            />,
        );

        // Then the exiting pill still points down, because flipping the arrow during the exit animation would flash an up arrow
        expect(screen.getByText('Approve')).toBeTruthy();
        expect(mockRenderedArrows).toContain('DownArrow');
        expect(mockRenderedArrows).not.toContain('UpArrow');
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

    it('keeps the action badge pill while it slides out instead of flashing the latest messages pill', () => {
        // Given the action badge pill is shown in a read chat that is not scrolled past the threshold
        const {rerender} = render(
            <FloatingMessageCounter
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.SUBMIT}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={jest.fn()}
            />,
        );

        // When the action badge target scrolls into view, so the list stops passing the badge and the pill starts hiding
        rerender(
            <FloatingMessageCounter
                hasNewMessages={false}
                onClick={jest.fn()}
                onActionBadgePress={jest.fn()}
            />,
        );

        // Then the exiting pill keeps its action badge content, because swapping it would flash the latest messages pill during the exit animation
        expect(screen.getByText('Submit')).toBeTruthy();
        expect(screen.queryByText('Latest messages')).toBeNull();
    });

    it('switches to the latest messages pill when the action badge hides while the counter stays active', () => {
        // Given the action badge pill is shown while the user is scrolled past the threshold
        const {rerender} = render(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.SUBMIT}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={jest.fn()}
            />,
        );

        // When the action badge target scrolls into view
        rerender(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
                onActionBadgePress={jest.fn()}
            />,
        );

        // Then the pill stays visible, so it should immediately become the latest messages pill
        expect(screen.getByText('Latest messages')).toBeTruthy();
        expect(screen.queryByText('Submit')).toBeNull();
    });

    it('keeps the latest messages pill while it slides out instead of restoring a previously shown action badge', () => {
        // Given an action badge pill that was replaced by the latest messages pill while the counter was active
        const {rerender} = render(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
                actionBadge={CONST.REPORT.ACTION_BADGE.SUBMIT}
                actionBadgeBrickRoadStatus={CONST.BRICK_ROAD_INDICATOR_STATUS.INFO}
                onActionBadgePress={jest.fn()}
            />,
        );
        rerender(
            <FloatingMessageCounter
                isActive
                hasNewMessages={false}
                onClick={jest.fn()}
                onActionBadgePress={jest.fn()}
            />,
        );

        // When the user scrolls back below the threshold and the pill starts hiding
        rerender(
            <FloatingMessageCounter
                hasNewMessages={false}
                onClick={jest.fn()}
                onActionBadgePress={jest.fn()}
            />,
        );

        // Then the exiting pill keeps the latest messages content, because the frozen content must be the last shown pill, not the last action badge
        expect(screen.getByText('Latest messages')).toBeTruthy();
        expect(screen.queryByText('Submit')).toBeNull();
    });
});
