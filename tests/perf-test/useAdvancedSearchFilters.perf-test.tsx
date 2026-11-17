import {LocaleContextProvider} from '@components/LocaleContextProvider';

import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';

import ComposeProviders from '@src/components/ComposeProviders';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const POLICY_COUNT = 5000;

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));

jest.mock('@hooks/useExportedToFilterOptions', () => ({
    __esModule: true,
    default: () => ({
        exportedToFilterOptions: [],
        connectedIntegrationNames: new Set<string>(),
    }),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        usePreventRemove: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
        }),
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

function TestComponent() {
    const currentType = 'expense';
    const filters = useAdvancedSearchFilters(currentType);
    return <View testID={`${currentType}-${filters.length}`} />;
}

function WrappedTestComponent() {
    return (
        <ComposeProviders components={[LocaleContextProvider]}>
            <TestComponent />
        </ComposeProviders>
    );
}

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(() => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
});

afterEach(() => Onyx.clear());

describe('useAdvancedSearchFilters', () => {
    test('hook initial render with policies', async () => {
        const policies = createCollection<Policy>(
            (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
            (index) => createRandomPolicy(index),
            POLICY_COUNT,
        );
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
        await waitForBatchedUpdates();

        await measureRenders(<WrappedTestComponent />);
    });

    test('re-render on unrelated policy change', async () => {
        const policies = createCollection<Policy>(
            (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
            (index) => createRandomPolicy(index),
            POLICY_COUNT,
        );
        await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
        await waitForBatchedUpdates();

        let counter = 0;
        const scenario = async () => {
            counter += 1;
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${counter % POLICY_COUNT}`, {name: `Updated Policy ${counter} ${Date.now()}`});
            await waitForBatchedUpdates();
        };

        await measureRenders(<WrappedTestComponent />, {scenario, runs: 20});
    });
});
