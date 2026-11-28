import {fireEvent, render, screen} from '@testing-library/react-native';

import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import CONST from '@src/CONST';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- the test reads the native ScrollView's props, which our wrapper forwards
import {ScrollView as RNScrollView} from 'react-native';

const TABS: TabSelectorBaseItem[] = [
    {key: 'first', title: 'First', sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.TAB.GENERAL},
    {key: 'second', title: 'Second', sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.TAB.CARD_RESTRICTIONS},
];

function renderRow(rowKey: string) {
    return (
        <TabSelectorContextProvider activeTabKey="second">
            <TabSelectorBase
                key={rowKey}
                tabs={TABS}
                activeTabKey="second"
            />
        </TabSelectorContextProvider>
    );
}

describe('TabSelectorBase remounted under the same provider', () => {
    it('mounts the new row at the offset the previous row was scrolled to', () => {
        // Given a tab row scrolled to 120 under a provider that outlives it, like the Rules page's row rendered once per tab
        const {rerender} = render(renderRow('firstRow'));
        fireEvent.scroll(screen.UNSAFE_getByType(RNScrollView), {nativeEvent: {contentOffset: {x: 120, y: 0}}});

        // When the row is replaced by a new one under the same provider
        rerender(renderRow('secondRow'));

        // Then the new row starts at the previous offset, so Android doesn't draw it at the beginning before scrolling it back
        expect(screen.UNSAFE_getByType(RNScrollView).props.contentOffset).toEqual({x: 120, y: 0});
    });
});
