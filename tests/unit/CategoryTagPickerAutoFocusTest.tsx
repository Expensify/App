import {render} from '@testing-library/react-native';

import CategoryPicker from '@components/CategoryPicker';
import type {CategoryPickerProps} from '@components/CategoryPicker';
import type {SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';
import TagPicker from '@components/TagPicker';
import type {TagPickerProps} from '@components/TagPicker';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type Navigation from '@libs/Navigation/Navigation';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

/**
 * These tests lock in the scoping added by the `shouldAutoFocusSearchInput` prop: the search input's
 * `disableAutoFocus` must stay `true` for the 8 page-level callers (which omit the prop) and only flip
 * to `false` when a caller opts in AND the surface can focus on screen focus (non-touch). We assert the
 * boolean threaded into `SelectionList`, NOT that the input actually receives focus — the real focus path
 * runs through `useFocusEffect` + a `setTimeout` racing the popover animation, which is verified on device.
 */

// Capture the props the pickers pass down to SelectionList so we can assert on `textInputOptions.disableAutoFocus`.
// Prefix `mock` so jest allows the variable inside the factory below.
const mockSelectionList = jest.fn<null, [SelectionListWithSectionsProps<ListItem>]>(() => null);
jest.mock('@components/SelectionList/SelectionListWithSections', () => ({
    __esModule: true,
    default: (props: SelectionListWithSectionsProps<ListItem>) => mockSelectionList(props),
}));

// Drives the second column of the truth table (touch vs non-touch). No mock for this exists in jest/ or
// tests/__mocks__/, so it is created here.
jest.mock('@libs/canFocusInputOnScreenFocus');
const mockedCanFocusInputOnScreenFocus = jest.mocked(canFocusInputOnScreenFocus);

// `useAutoFocusInput` (still wired into both pickers) pulls in navigation. Stub it like the closest existing
// precedent, tests/unit/BaseSelectionListSectionsTest.tsx, so the effect never runs in jsdom.
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

function getLastDisableAutoFocus(): boolean | undefined {
    const lastCall = mockSelectionList.mock.calls.at(-1);
    return lastCall?.[0].textInputOptions?.disableAutoFocus;
}

const POLICY_ID = 'A1B2C3';

const renderCategoryPicker = (shouldAutoFocusSearchInput?: boolean) => {
    const props: CategoryPickerProps = {policyID: POLICY_ID, onSubmit: jest.fn(), shouldAutoFocusSearchInput};
    return render(<CategoryPicker {...props} />);
};

const renderTagPicker = (shouldAutoFocusSearchInput?: boolean) => {
    const props: TagPickerProps = {policyID: POLICY_ID, selectedTag: '', tagListName: 'Tag', tagListIndex: 0, onSubmit: jest.fn(), shouldAutoFocusSearchInput};
    return render(<TagPicker {...props} />);
};

const pickers = [
    {name: 'CategoryPicker', renderPicker: renderCategoryPicker},
    {name: 'TagPicker', renderPicker: renderTagPicker},
] as const;

// Truth table for `disableAutoFocus: !(shouldAutoFocusSearchInput && canFocusInputOnScreenFocus())`.
const cases = [
    {description: 'omitted (default) + canFocus true → disabled (page-level regression guard)', shouldAutoFocusSearchInput: undefined, canFocus: true, expectedDisableAutoFocus: true},
    {description: 'opted in + canFocus true → enabled (inline-edit popover on desktop)', shouldAutoFocusSearchInput: true, canFocus: true, expectedDisableAutoFocus: false},
    {description: 'opted in + canFocus false → disabled (large-screen touch, e.g. iPad)', shouldAutoFocusSearchInput: true, canFocus: false, expectedDisableAutoFocus: true},
] as const;

describe.each(pickers)('$name shouldAutoFocusSearchInput threading', ({renderPicker}) => {
    beforeEach(() => {
        mockSelectionList.mockClear();
        mockedCanFocusInputOnScreenFocus.mockReset();
    });

    it.each(cases)('$description', async ({shouldAutoFocusSearchInput, canFocus, expectedDisableAutoFocus}) => {
        mockedCanFocusInputOnScreenFocus.mockReturnValue(canFocus);

        renderPicker(shouldAutoFocusSearchInput);
        // Flush the pickers' async useOnyx subscriptions so their re-render settles inside act().
        await waitForBatchedUpdatesWithAct();

        expect(getLastDisableAutoFocus()).toBe(expectedDisableAutoFocus);
    });
});
