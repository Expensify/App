import {fireEvent, render, screen} from '@testing-library/react-native';

import SpendRuleListItem from '@components/SelectionList/ListItem/SpendRuleListItem';
import type {SpendRuleListItemType} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';

const buildItem = (isSelected: boolean): SpendRuleListItemType => ({
    keyForList: 'rule-1',
    text: 'Travel rule',
    isSelected,
    action: CONST.SPEND_RULES.ACTION.ALLOW,
    summary: 'Applies to all travel cards',
    summaryParts: [
        {badgeLabel: 'Approve', text: 'Flights under $500', variant: CONST.SPEND_RULES.BADGE_VARIANTS.SUCCESS},
        {badgeLabel: 'Decline', text: 'Hotels over $300', variant: CONST.SPEND_RULES.BADGE_VARIANTS.ERROR},
    ],
    searchTokens: ['travel'],
});

describe('SpendRuleListItem', () => {
    it('renders the summary and every summary part', () => {
        render(
            <SpendRuleListItem
                item={buildItem(false)}
                showTooltip={false}
                onSelectRow={jest.fn()}
            />,
        );

        expect(screen.getByText('Applies to all travel cards')).toBeOnTheScreen();
        expect(screen.getByText('Approve')).toBeOnTheScreen();
        expect(screen.getByText('Flights under $500')).toBeOnTheScreen();
        expect(screen.getByText('Decline')).toBeOnTheScreen();
        expect(screen.getByText('Hotels over $300')).toBeOnTheScreen();
    });

    it.each([
        [true, true, false],
        [false, false, true],
    ])('with isSelected=%s renders the checkbox checked=%s and disabled=%s', (isSelected, expectedChecked, expectedDisabled) => {
        render(
            <SpendRuleListItem
                item={buildItem(isSelected)}
                showTooltip={false}
                onSelectRow={jest.fn()}
            />,
        );

        const checkbox = screen.getByRole(CONST.ROLE.CHECKBOX);
        expect(checkbox.props.accessibilityState).toEqual(expect.objectContaining({checked: expectedChecked, disabled: expectedDisabled}));
    });

    it('selects the row when the checkbox is pressed', () => {
        const onSelectRow = jest.fn();
        const item = buildItem(true);
        render(
            <SpendRuleListItem
                item={item}
                showTooltip={false}
                onSelectRow={onSelectRow}
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.CHECKBOX));

        expect(onSelectRow).toHaveBeenCalledWith(item);
    });
});
