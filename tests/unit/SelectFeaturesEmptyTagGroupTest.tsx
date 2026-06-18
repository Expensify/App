import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ListItem} from '@components/SelectionList/types';

import CopyPolicySettingsSelectFeaturesPage from '@pages/workspace/copyPolicySettings/CopyPolicySettingsSelectFeaturesPage';
import WorkspaceDuplicateSelectFeaturesForm from '@pages/workspace/duplicate/WorkspaceDuplicateSelectFeaturesForm';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';

import {render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const POLICY_ID = '1';

// Captures the `data` prop handed to SelectionList on every render so the test can both
// confirm the component reached its return (no crash in the body) and inspect the computed tag count.
const mockSelectionListData: ListItem[][] = [];

jest.mock('@components/SelectionList', () => ({
    __esModule: true,
    default: (props: {data: ListItem[]}) => {
        mockSelectionListData.push(props.data);
        return null;
    },
}));

// CopyPolicySettingsSelectFeaturesPage reads the source policyID from the route.
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useRoute: () => ({params: {policyID: '1'}}),
    };
});

// Bypass the access gate so the test exercises the feature-selection body directly.
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

// ScreenWrapper pulls in navigator-only hooks (usePreventRemove) that need a real navigation container.
// The crashing totalTags reducer runs in the component body before ScreenWrapper renders, so a pass-through keeps the test focused on the fix.
jest.mock('@components/ScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode)}) =>
        typeof children === 'function' ? children({insets: {top: 0, bottom: 0, left: 0, right: 0}, safeAreaPaddingBottomStyle: {}, didScreenTransitionEnd: true}) : children,
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn(() => Promise.resolve({action: 'cancel'}))}),
}));

// WorkspaceDuplicateSelectFeaturesForm fires openDuplicatePolicyPage on mount; stub it to avoid a network write.
jest.mock('@userActions/Policy/Policy', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Policy/Policy');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        openDuplicatePolicyPage: jest.fn(),
    };
});

/**
 * A tag list collection where one group is fully populated and another has no `tags` field at all.
 * The empty group reproduces the runtime shape that crashed both pages (`Object.values(undefined)`).
 */
const POLICY_TAGS_WITH_EMPTY_GROUP = {
    Region: {
        name: 'Region',
        required: false,
        orderWeight: 0,
        tags: {
            NY: {name: 'NY', enabled: true},
            LA: {name: 'LA', enabled: true},
        },
    },
    Project: {
        name: 'Project',
        required: false,
        orderWeight: 1,
        // `tags` intentionally omitted to mimic a tag group with no tags defined.
    },
} as unknown as PolicyTagLists;

describe('Select features pages with an empty tag group', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockSelectionListData.length = 0;
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, createRandomPolicy(Number(POLICY_ID)));
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, POLICY_TAGS_WITH_EMPTY_GROUP);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    it('CopyPolicySettingsSelectFeaturesPage renders without crashing when a tag group has no tags', () => {
        render(
            <OnyxListItemProvider>
                <CopyPolicySettingsSelectFeaturesPage />
            </OnyxListItemProvider>,
        );

        // Reaching SelectionList proves the totalTags reducer ran past the previously-crashing
        // `Object.values(tagGroup.tags)` call instead of throwing into the ErrorBoundary.
        expect(mockSelectionListData.length).toBeGreaterThan(0);
    });

    it('WorkspaceDuplicateSelectFeaturesForm renders without crashing and counts only populated tag groups', () => {
        render(
            <OnyxListItemProvider>
                <WorkspaceDuplicateSelectFeaturesForm policyID={POLICY_ID} />
            </OnyxListItemProvider>,
        );

        expect(mockSelectionListData.length).toBeGreaterThan(0);

        const renderedData = mockSelectionListData.at(-1) ?? [];
        const tagsItem = renderedData.find((item) => item.keyForList === 'tags');

        // The empty "Project" group must contribute 0, so only the two "Region" tags are counted.
        expect(tagsItem?.alternateText).toMatch(/^2\b/);
    });
});
