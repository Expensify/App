import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';
import TagPicker from '@components/TagPicker';

import type Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {setupGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/API');

// Capture the sections TagPicker hands to the list, so the tests can read what it would show.
const mockSelectionList = jest.fn<null, [SelectionListWithSectionsProps<ListItem>]>(() => null);
jest.mock('@components/SelectionList/SelectionListWithSections', () => ({
    __esModule: true,
    default: (props: SelectionListWithSectionsProps<ListItem>) => mockSelectionList(props),
}));

// `useAutoFocusInput` pulls in navigation, so stub it the same way as tests/unit/CategoryTagPickerAutoFocusTest.tsx.
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
        useFocusEffect: jest.fn(),
        useNavigation: jest.fn(() => ({
            isFocused: jest.fn(() => true),
            addListener: jest.fn(() => jest.fn()),
        })),
    };
});

setupGlobalFetchMock();

const POLICY_ID = 'tagPickerTestPolicy';
const TAG_LIST_NAME = 'Project';

const policyTags: PolicyTagLists = {
    [TAG_LIST_NAME]: {
        name: TAG_LIST_NAME,
        orderWeight: 0,
        required: false,
        tags: {
            Delta: {name: 'Delta', enabled: true},
            alpha: {name: 'alpha', enabled: true},
            Charlie: {name: 'Charlie', enabled: true},
            Bravo: {name: 'Bravo', enabled: false},
        },
    },
};

function getLastListProps() {
    const listProps = mockSelectionList.mock.lastCall?.[0];
    if (!listProps) {
        throw new Error('TagPicker did not render the list');
    }
    return listProps;
}

function getListedTagNames() {
    return getLastListProps().sections.flatMap((section) => section.data.map((item) => item.keyForList));
}

async function typeSearch(searchValue: string) {
    await act(async () => {
        getLastListProps().textInputOptions?.onChangeText?.(searchValue);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('TagPicker', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        mockSelectionList.mockClear();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, policyTags);
        });
    });

    it('lists a tag added while it is open, in name order, with and without a search', async () => {
        // Given an open tag picker
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <TagPicker
                    policyID={POLICY_ID}
                    selectedTag=""
                    tagListName={TAG_LIST_NAME}
                    tagListIndex={0}
                    onSubmit={jest.fn()}
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(getListedTagNames()).toEqual(['alpha', 'Charlie', 'Delta']);

        // When the user searches, and a tag that matches is then added to the workspace
        await typeSearch('a');
        expect(getListedTagNames()).toEqual(['alpha', 'Charlie', 'Delta']);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {[TAG_LIST_NAME]: {tags: {Able: {name: 'Able', enabled: true}}}});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the search results include the new tag in name order, and so does the full list once the search is cleared
        expect(getListedTagNames()).toEqual(['Able', 'alpha', 'Charlie', 'Delta']);
        await typeSearch('');
        expect(getListedTagNames()).toEqual(['Able', 'alpha', 'Charlie', 'Delta']);
    });
});
