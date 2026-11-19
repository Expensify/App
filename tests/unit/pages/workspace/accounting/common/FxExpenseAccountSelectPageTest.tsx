import {act, render} from '@testing-library/react-native';

import type {SelectionScreenProps, SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';

import FxExpenseAccountSelectPage from '@pages/workspace/accounting/common/FxExpenseAccountSelectPage';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({ph5: {paddingHorizontal: 20}, pv3: {paddingVertical: 12}}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({Telescope: 1}),
}));

const description = <View testID="description" />;
const accounts: SelectorType[] = [
    {value: '', text: 'None', keyForList: CONST.SEARCH.NONE_OPTION_KEY, isSelected: true},
    ...Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT}, (_, index) => ({value: String(index), text: `Account ${index}`, keyForList: String(index)})),
];

function renderPicker(props: Partial<SelectionScreenProps> = {}) {
    return render(
        <FxExpenseAccountSelectPage
            displayName="TestPicker"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            data={accounts}
            onSelectRow={jest.fn()}
            emptyStateTitle="No accounts found"
            emptyStateSubtitle="Sync accounts to select one"
            {...props}
        >
            {description}
        </FxExpenseAccountSelectPage>,
    );
}

function getScreenProps() {
    const props = jest.mocked(SelectionScreen).mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Expected SelectionScreen to render');
    }
    return props;
}

function searchAccounts(value: string) {
    act(() => getScreenProps().textInputOptions?.onChangeText?.(value));
    act(() => jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME));
}

describe('FxExpenseAccountSelectPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('filters None, shows search misses, and restores the list when search is cleared', () => {
        // Given the shared page uses the real search hook with None selected.
        renderPicker();
        expect(getScreenProps().data.at(0)?.value).toBe('');
        expect(getScreenProps().textInputOptions?.label).toBe('common.search');

        // When a search matches accounts and then matches nothing.
        searchAccounts('Account');
        expect(getScreenProps().data).toHaveLength(accounts.length - 1);
        expect(getScreenProps().data.some((account) => account.value === '')).toBe(false);
        searchAccounts('missing');

        // Then a search miss uses the message rather than the missing-accounts illustration.
        expect(getScreenProps().data).toEqual([]);
        expect(getScreenProps().textInputOptions?.headerMessage).toBe('common.noResultsFound');
        expect(getScreenProps().shouldShowListEmptyContent).toBe(false);

        // When search is cleared.
        searchAccounts('');

        // Then the full list and its original None selection return.
        expect(getScreenProps().data).toEqual(accounts);
        expect(getScreenProps().shouldShowListEmptyContent).toBe(true);
        expect(getScreenProps().textInputOptions?.headerMessage).toBeUndefined();
    });

    it('keeps the missing-accounts state separate from search results', () => {
        // Given the integration has no synced accounts.
        // When the shared page opens without a search.
        renderPicker({data: []});

        // Then the existing empty state is available with the integration's copy.
        expect(getScreenProps().data).toEqual([]);
        expect(getScreenProps().shouldShowListEmptyContent).toBe(true);
        const emptyState = getScreenProps().listEmptyContent;
        expect(React.isValidElement(emptyState)).toBe(true);
        if (!React.isValidElement<{title: string; subtitle: string}>(emptyState)) {
            throw new Error('Expected an empty state');
        }
        expect(emptyState.props).toMatchObject({title: 'No accounts found', subtitle: 'Sync accounts to select one'});
    });

    it('preserves the integration header, feedback, focus, and Save callback', () => {
        // Given an integration supplies its own title, access requirements, feedback, and Save action.
        const props = {
            policyID: '1',
            headerTitleAlreadyTranslated: 'Currency conversion fee account',
            accessVariants: [CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID],
            shouldBeBlocked: true,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            errors: {error: 'Unable to save'},
            initiallyFocusedOptionKey: CONST.SEARCH.NONE_OPTION_KEY,
            onClose: jest.fn(),
            confirmButtonOptions: {showButton: true, isDisabled: false, onConfirm: jest.fn()},
        } satisfies Partial<SelectionScreenProps>;

        // When the shared page renders.
        renderPicker(props);

        // Then these values reach SelectionScreen alongside the unchanged common behavior.
        expect(getScreenProps()).toMatchObject({
            ...props,
            headerContent: description,
            featureName: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
            shouldSingleExecuteRowSelect: true,
            shouldUpdateFocusedIndex: true,
            errorRowStyles: [{paddingHorizontal: 20}, {paddingVertical: 12}],
        });
    });

    it('preserves QBO error spacing instead of replacing it with the shared default', () => {
        // Given QBO uses vertical margins where the other integrations use padding.
        const errorRowStyles = [{marginVertical: 12}];

        // When QBO supplies its existing style.
        renderPicker({errorRowStyles});

        // Then the same style reaches the selection screen.
        expect(getScreenProps().errorRowStyles).toBe(errorRowStyles);
    });
});
