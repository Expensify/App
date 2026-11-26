import {render, screen, within} from '@testing-library/react-native';

import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import Tooltip from '@components/Tooltip';

import CONST from '@src/CONST';

import React from 'react';

// The real Tooltip portals its content, which RNTL can't render
jest.mock('@components/Tooltip');

const TABS = [
    {key: 'expenses', title: 'Expenses', sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL},
    {key: 'reports', title: 'Reports', sentryLabel: CONST.SENTRY_LABEL.TEST.LABEL},
];

function renderTabs(itemRole?: typeof CONST.ROLE.TAB | typeof CONST.ROLE.RADIO) {
    return render(
        <TabSelectorContextProvider activeTabKey="reports">
            <TabSelectorBase
                tabs={TABS}
                activeTabKey="reports"
                itemRole={itemRole}
            />
        </TabSelectorContextProvider>,
    );
}

describe('TabSelectorBase', () => {
    beforeEach(() => {
        jest.mocked(Tooltip).mockImplementation(({children}) => children);
    });

    it('groups its tabs in a tab list so screen readers read the tab role, the selection and the position of each tab', () => {
        // Given a row of tabs like the ones at the top of Spend and Insights
        renderTabs();

        // When a screen reader looks for the row
        // RNTL's role queries only match focusable elements, and a tab list is a container, so it is found by its props
        const tabList = screen.UNSAFE_getByProps({role: CONST.ROLE.TABLIST});

        // Then every tab sits inside it, and the active one is marked as selected
        expect(within(tabList).getAllByRole(CONST.ROLE.TAB)).toHaveLength(TABS.length);
        expect(within(tabList).getByRole(CONST.ROLE.TAB, {name: 'Reports', selected: true})).toBeOnTheScreen();
        expect(within(tabList).getByRole(CONST.ROLE.TAB, {name: 'Expenses', selected: false})).toBeOnTheScreen();
    });

    it('leaves the group to the caller when the items are radio buttons, so they are not exposed as a tab list', () => {
        // Given a row whose items answer a form question, which its caller wraps in a radio group
        renderTabs(CONST.ROLE.RADIO);

        // When a screen reader looks for a tab list
        // Then there is none, since radio buttons belong to a radio group
        expect(screen.UNSAFE_queryByProps({role: CONST.ROLE.TABLIST})).toBeNull();
        expect(screen.getAllByRole(CONST.ROLE.RADIO)).toHaveLength(TABS.length);
    });
});
