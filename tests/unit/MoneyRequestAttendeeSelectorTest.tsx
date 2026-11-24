import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import type {SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';

import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';

import MoneyRequestAttendeeSelector from '@pages/iou/request/MoneyRequestAttendeeSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Asking for contacts needs a navigator, and contacts don't change where the list puts its button.
jest.mock('@libs/ContactPermission/useContactPermissions', () => jest.fn());
jest.mock('@hooks/useShouldFooterBeInsideList', () => jest.fn(() => false));

// Only what the selector hands its list matters here, so the list just records its props.
let mockListProps: SelectionListWithSectionsProps<ListItem> | undefined;
jest.mock('@components/SelectionList/SelectionListWithSections', () => (props: SelectionListWithSectionsProps<ListItem>) => {
    mockListProps = props;
    return null;
});

const attendees: Attendee[] = [{email: 'creator@example.com', displayName: 'Creator', avatarUrl: ''}];
const SETTLED_SCREEN_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false};

function renderSelector() {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
            <ScreenWrapperStatusContext.Provider value={SETTLED_SCREEN_STATUS}>
                <MoneyRequestAttendeeSelector
                    attendees={attendees}
                    onFinish={jest.fn()}
                    onAttendeesAdded={jest.fn()}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                />
            </ScreenWrapperStatusContext.Provider>
        </ComposeProviders>,
    );
}

describe('MoneyRequestAttendeeSelector', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockListProps = undefined;
    });

    it.each([true, false])('puts its Save button inside the list only when the keyboard leaves no room for a fixed footer (%s)', async (shouldFooterBeInsideList) => {
        // Given a selection, so the list shows its Save button, and a layout where the keyboard does or doesn't leave room
        // for a fixed footer, e.g. a phone in landscape with the keyboard open
        jest.mocked(useShouldFooterBeInsideList).mockReturnValue(shouldFooterBeInsideList);

        // When the attendee list renders
        renderSelector();
        await waitForBatchedUpdatesWithAct();

        // Then the button scrolls with the rows only when there's no room, so it doesn't cover the results being searched
        expect(mockListProps?.footerContent).toBeTruthy();
        expect(mockListProps?.shouldFooterBeInsideList).toBe(shouldFooterBeInsideList);
    });
});
