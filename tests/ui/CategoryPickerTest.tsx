import {render} from '@testing-library/react-native';

import CategoryPicker from '@components/CategoryPicker';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';

// eslint-disable-next-line no-restricted-imports -- Type-only namespace import used to type jest.requireActual for the react-native-onyx mock.
import type * as ReactNativeOnyx from 'react-native-onyx';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- CategoryPicker reads the GL-code flags via the raw react-native-onyx useOnyx (to bypass the Search snapshot); the test drives that same hook.
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

// The GL-code visibility flag must be read from live Onyx, not the Search snapshot (which trims
// `showCategoryGLCodes`/`glCodes` from the policy). CategoryPicker reads the flag via the raw
// react-native-onyx `useOnyx` (mocked here as `useOnyxWithoutSnapshots`) and the categories via the
// snapshot-aware `@hooks/useOnyx`, so we can drive the two independently.
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn()})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/useDebouncedState', () => jest.fn(() => ['', '', jest.fn()]));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);
jest.mock('react-native-onyx', () => {
    const actual = jest.requireActual<typeof ReactNativeOnyx>('react-native-onyx');
    return {__esModule: true, ...actual, useOnyx: jest.fn()};
});

const POLICY_ID = '1';

const GL_CODE_FIELD = 'GL Code';

const makeCategory = (name: string, glCode: string): PolicyCategories[string] => ({
    enabled: true,
    name,
    unencodedName: name,
    areCommentsRequired: false,
    [GL_CODE_FIELD]: glCode,
    externalID: '',
    origin: '',
    pendingAction: undefined,
});

const findRow = (searchText: string) =>
    jest
        .mocked(SelectionListWithSections)
        .mock.lastCall?.[0].sections.flatMap((section) => section.data)
        .find((row) => row.searchText === searchText);

describe('CategoryPicker', () => {
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedUseOnyxWithoutSnapshots = jest.mocked(useOnyxWithoutSnapshots);

    beforeEach(() => {
        jest.mocked(SelectionListWithSections).mockClear();

        // `@hooks/useOnyx` (snapshot-aware) provides the categories. GL codes live on the categories
        // themselves, which are NOT trimmed by the snapshot.
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`) {
                return [{Advertising: makeCategory('Advertising', '12'), Benefits: makeCategory('Benefits', '13')}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('shows GL codes on Search even when the snapshot policy is missing the GL-code flags (regression #96810)', () => {
        // Live policy has the GL-code flags → selector resolves to true.
        mockedUseOnyxWithoutSnapshots.mockReturnValue([true, {status: 'loaded'}]);

        render(
            <CategoryPicker
                policyID={POLICY_ID}
                onSubmit={jest.fn()}
            />,
        );

        expect(findRow('Advertising')?.alternateText).toBe('12');
        expect(findRow('Benefits')?.alternateText).toBe('13');
    });

    it('does not show GL codes when the policy has the GL-code flags disabled', () => {
        // Live policy has the flag disabled → selector resolves to false.
        mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);

        render(
            <CategoryPicker
                policyID={POLICY_ID}
                onSubmit={jest.fn()}
            />,
        );

        expect(findRow('Advertising')?.alternateText).toBeUndefined();
        expect(findRow('Benefits')?.alternateText).toBeUndefined();
    });

    it('never reads a bare collection key when the policy ID is an empty string', () => {
        mockedUseOnyxWithoutSnapshots.mockReturnValue([false, {status: 'loaded'}]);

        render(
            <CategoryPicker
                policyID=""
                onSubmit={jest.fn()}
            />,
        );

        const collectionKeys: string[] = [
            ONYXKEYS.COLLECTION.POLICY,
            ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
            ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT,
            ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
        ];
        const requestedKeys = [...mockedUseOnyx.mock.calls, ...mockedUseOnyxWithoutSnapshots.mock.calls].map(([key]) => key);

        expect(requestedKeys.length).toBeGreaterThan(0);
        for (const key of requestedKeys) {
            expect(collectionKeys).not.toContain(key);
        }
    });
});
