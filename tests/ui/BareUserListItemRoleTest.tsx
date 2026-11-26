import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLocalize', () => () => ({translate: jest.fn((path: string) => path), formatPhoneNumber: jest.fn((value: string) => value)}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemUserAvatar', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemReportAvatar', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemWorkspaceAvatar', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemRightCaret', () => jest.fn(() => null));

const item: ListItem = {text: 'Audit Tester', keyForList: 'recipient'};

function renderRow(shouldUseOptionRole?: boolean) {
    return render(
        <OnyxListItemProvider>
            <BareUserListItem
                item={item}
                showTooltip={false}
                onSelectRow={jest.fn()}
                shouldUseOptionRole={shouldUseOptionRole}
            />
        </OnyxListItemProvider>,
    );
}

describe('BareUserListItem role', () => {
    it('keeps the button role for a row that opens another page', () => {
        // Given a row that navigates, like the recipient on the expense confirmation, which Android cannot announce as an option
        // When it renders with the option role turned off
        renderRow(false);

        // Then it stays a button, so screen readers say it can be activated
        expect(screen.getByRole(CONST.ROLE.BUTTON)).toBeOnTheScreen();
    });

    it('stays a listbox option by default, as single-select lists expect', () => {
        // Given a row in a single-select list
        // When it renders with the default role
        renderRow();

        // Then it keeps the option role those lists rely on
        expect(screen.getByRole(CONST.ROLE.OPTION)).toBeOnTheScreen();
    });
});
