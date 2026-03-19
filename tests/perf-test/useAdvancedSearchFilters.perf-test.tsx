import type * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import Onyx from 'react-native-onyx';
import {measureFunction, measureRenders} from 'reassure';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import {isPolicyFeatureEnabled} from '@libs/PolicyUtils';
import ComposeProviders from '@src/components/ComposeProviders';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const POLICY_COUNT = 5000;
const LARGE_POLICY_COUNT = 50000;

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
}));

jest.mock('@hooks/useExportedToFilterOptions', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        exportedToFilterOptions: [],
        combinedUniqueExportTemplates: [],
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
    const {currentType, typeFiltersKeys: filters} = useAdvancedSearchFilters();
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
    test('policy-derived computation', async () => {
        const policies = createCollection<Policy>(
            (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
            (index) => createRandomPolicy(index),
            LARGE_POLICY_COUNT,
        );

        await measureFunction(() => {
            // Optimized: single pass over all policies with early-exit flags
            let areCategoriesEnabled = false;
            let areTagsEnabled = false;
            let areTaxEnabled = false;
            let isAttendeeTrackingEnabled = false;
            let hasReportFields = false;
            let hasAnyTaxRates = false;
            let hasNonPersonalPolicyCategories = false;

            for (const policy of Object.values(policies ?? {})) {
                if (!policy) {
                    continue;
                }
                if (!hasNonPersonalPolicyCategories && policy.type !== CONST.POLICY.TYPE.PERSONAL) {
                    hasNonPersonalPolicyCategories = true;
                }
                if (!areCategoriesEnabled) {
                    areCategoriesEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED);
                }
                if (!areTagsEnabled) {
                    areTagsEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED);
                }
                if (!areTaxEnabled) {
                    areTaxEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED);
                }
                if (!isAttendeeTrackingEnabled) {
                    isAttendeeTrackingEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.IS_ATTENDEE_TRACKING_ENABLED);
                }
                if (!hasReportFields) {
                    hasReportFields = Object.values(policy.fieldList ?? {}).some((val) => val.type !== CONST.POLICY.DEFAULT_FIELD_LIST_TYPE);
                }
                if (!hasAnyTaxRates && areTaxEnabled) {
                    hasAnyTaxRates = Object.keys(policy.taxRates?.taxes ?? {}).length > 0;
                }
            }
        });
    });

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
