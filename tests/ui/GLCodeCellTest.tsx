import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CategoryGLCodeCell from '@components/TransactionItemRow/DataCells/CategoryGLCodeCell';
import TagGLCodeCell from '@components/TransactionItemRow/DataCells/TagGLCodeCell';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories, PolicyTagLists, Transaction} from '@src/types/onyx';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation');

// Forces the cell into the "wide/editable" layout branch, which jsdom's default viewport doesn't naturally satisfy.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({isLargeScreenWidth: true, shouldUseNarrowLayout: false, isInNarrowPaneModal: false}),
}));

// EditableCell only renders the edit-pencil button while hovered, which jsdom can't simulate reliably.
jest.mock('@components/Hoverable', () => ({
    __esModule: true,
    default: ({children}: {children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode}) => (typeof children === 'function' ? children(true) : children),
}));

// Mirrors TotalCellTest.tsx so the presence of the pencil button can be asserted by testID.
jest.mock('@components/Pressable/PressableWithFeedback', () => {
    const {TouchableOpacity} = jest.requireActual<typeof ReactNative>('react-native');
    function mockPressableWithFeedback({
        children,
        onPress,
        accessibilityLabel,
    }: {
        children: React.ReactNode | ((state: {hovered: boolean; pressed: boolean}) => React.ReactNode);
        onPress: () => void;
        accessibilityLabel?: string;
    }) {
        const content = typeof children === 'function' ? children({hovered: false, pressed: false}) : children;
        return (
            <TouchableOpacity
                testID="mock-edit-button"
                onPress={onPress}
                accessibilityLabel={accessibilityLabel}
            >
                {content}
            </TouchableOpacity>
        );
    }
    return {__esModule: true, default: mockPressableWithFeedback};
});

const POLICY_ID = 'glCodePolicy';

const transaction: Transaction = {
    ...createRandomTransaction(1),
    category: 'Travel',
    tag: 'Engineering',
};

const categoriesWithoutGLCode: PolicyCategories = {
    Travel: {name: 'Travel', enabled: true},
};

const categoriesWithGLCode: PolicyCategories = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Travel: {name: 'Travel', enabled: true, 'GL Code': '6000'},
};

const buildTagLists = (glCode?: string): PolicyTagLists => ({
    Department: {
        name: 'Department',
        required: false,
        orderWeight: 0,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tags: {Engineering: {name: 'Engineering', enabled: true, 'GL Code': glCode}},
    },
});

const renderCategoryGLCodeCell = (policyCategories: PolicyCategories) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <CategoryGLCodeCell
                transactionItem={transaction}
                shouldShowTooltip={false}
                canEdit
                onSave={jest.fn()}
                policyID={POLICY_ID}
                policyCategories={policyCategories}
            />
        </ComposeProviders>,
    );

const renderTagGLCodeCell = (policyTagLists: PolicyTagLists) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <TagGLCodeCell
                transactionItem={transaction}
                shouldShowTooltip={false}
                canEdit
                onSave={jest.fn()}
                policyID={POLICY_ID}
                policyTagLists={policyTagLists}
            />
        </ComposeProviders>,
    );

describe('GL code cells', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await waitForBatchedUpdates();
    });

    describe('CategoryGLCodeCell', () => {
        it('is editable before the full category list has loaded, even when no loaded category has a GL code', async () => {
            // Given a lazy-loaded workspace whose categories have never been fetched, so the local list may be partial
            renderCategoryGLCodeCell(categoriesWithoutGLCode);
            await waitForBatchedUpdates();

            // Then the cell stays editable so opening the picker can fetch the full list
            expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
        });

        it('is read-only once the full category list has loaded without any GL codes', async () => {
            // Given the full category list has loaded and no category has a GL code
            await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${POLICY_ID}`, {hasOnceLoaded: true, isLoading: false});
            renderCategoryGLCodeCell(categoriesWithoutGLCode);
            await waitForBatchedUpdates();

            // Then there is nothing to pick, so the cell is read-only
            expect(screen.queryByTestId('mock-edit-button')).not.toBeOnTheScreen();
        });

        it('is editable once the full category list has loaded with a GL code', async () => {
            // Given the full category list has loaded and a category has a GL code
            await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_CATEGORIES_LOADING_STATE}${POLICY_ID}`, {hasOnceLoaded: true, isLoading: false});
            renderCategoryGLCodeCell(categoriesWithGLCode);
            await waitForBatchedUpdates();

            // Then the cell is editable
            expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
        });
    });

    describe('TagGLCodeCell', () => {
        it('is editable before the full tag list has loaded, even when no loaded tag has a GL code', async () => {
            // Given a lazy-loaded workspace whose tags have never been fetched, so the local list may be partial
            renderTagGLCodeCell(buildTagLists());
            await waitForBatchedUpdates();

            // Then the cell stays editable so opening the picker can fetch the full list
            expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
        });

        it('is read-only once the full tag list has loaded without any GL codes', async () => {
            // Given the full tag list has loaded and no tag has a GL code
            await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${POLICY_ID}`, {hasOnceLoaded: true, isLoading: false});
            renderTagGLCodeCell(buildTagLists());
            await waitForBatchedUpdates();

            // Then there is nothing to pick, so the cell is read-only
            expect(screen.queryByTestId('mock-edit-button')).not.toBeOnTheScreen();
        });

        it('is editable once the full tag list has loaded with a GL code', async () => {
            // Given the full tag list has loaded and a tag has a GL code
            await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE}${POLICY_ID}`, {hasOnceLoaded: true, isLoading: false});
            renderTagGLCodeCell(buildTagLists('4000'));
            await waitForBatchedUpdates();

            // Then the cell is editable
            expect(await screen.findByTestId('mock-edit-button')).toBeOnTheScreen();
        });
    });
});
