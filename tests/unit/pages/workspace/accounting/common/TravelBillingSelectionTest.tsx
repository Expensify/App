import {act, render} from '@testing-library/react-native';

import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';

import TravelBillingPayableAccountSelectPage from '@pages/workspace/accounting/common/TravelBillingPayableAccountSelectPage';
import TravelBillingVendorSelectPage from '@pages/workspace/accounting/common/TravelBillingVendorSelectPage';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({Telescope: 1}),
}));

const SAVED_OPTION: SelectorType = {value: 'id-1', keyForList: 'First name', text: 'First name', isSelected: true};
const SECOND_OPTION: SelectorType = {value: 'id-2', keyForList: 'Second name', text: 'Second name', isSelected: false};
const THIRD_OPTION: SelectorType = {value: 'id-3', keyForList: 'Third name', text: 'Third name', isSelected: false};
const OPTIONS = [SAVED_OPTION, SECOND_OPTION, THIRD_OPTION];

function getSelectionScreenProps() {
    const props = jest.mocked(SelectionScreen).mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Expected SelectionScreen to render');
    }
    return props;
}

function selectOption(option: SelectorType) {
    act(() => getSelectionScreenProps().onSelectRow(option));
}

function saveSelection() {
    act(() => getSelectionScreenProps().confirmButtonOptions?.onConfirm?.());
}

describe.each([
    ['payable account', TravelBillingPayableAccountSelectPage],
    ['vendor', TravelBillingVendorSelectPage],
] as const)('Travel billing %s selection', (name, Page) => {
    const onSelect = jest.fn<void, [SelectorType]>();
    const onBack = jest.fn();
    const onClose = jest.fn();
    const props = {
        policyID: '1',
        displayName: `TravelBilling${name}`,
        data: OPTIONS,
        connectionName: CONST.POLICY.CONNECTIONS.NAME.QBO,
        emptyStateTitle: 'workspace.qbo.noAccountsFound' as const,
        emptyStateSubtitle: 'workspace.qbo.noAccountsFoundDescription' as const,
        onSelect,
        onBack,
        onClose,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('disables Save for the saved selection', () => {
        // Given: the persisted selection is already in the list.
        // When: the page opens and an unchanged confirmation is attempted.
        render(<Page {...props} />);
        saveSelection();

        // Then: Save is disabled and the existing commit callback is not invoked.
        expect(getSelectionScreenProps().confirmButtonOptions).toEqual(expect.objectContaining({showButton: true, text: 'common.save', isDisabled: true}));
        expect(getSelectionScreenProps().data.filter((option) => option.isSelected)).toEqual([SAVED_OPTION]);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('stages multiple selections and saves the latest original row once', () => {
        // Given: row keys are names, but the values passed to the action are IDs.
        render(<Page {...props} />);

        // When: the user changes their mind without saving.
        selectOption(SECOND_OPTION);
        selectOption(THIRD_OPTION);

        // Then: only the checkmark changes, and the original data and initial focus stay intact.
        expect(onSelect).not.toHaveBeenCalled();
        expect(onBack).not.toHaveBeenCalled();
        expect(
            getSelectionScreenProps()
                .data.filter((option) => option.isSelected)
                .map((option) => option.value),
        ).toEqual([THIRD_OPTION.value]);
        expect(getSelectionScreenProps().initiallyFocusedOptionKey).toBe(SAVED_OPTION.keyForList);
        expect(SAVED_OPTION.isSelected).toBe(true);
        expect(THIRD_OPTION.isSelected).toBe(false);

        // When: Save is pressed twice during the navigation transition.
        saveSelection();
        saveSelection();

        // Then: the existing callback receives the original row exactly once.
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls.at(0)?.at(0)).toBe(THIRD_OPTION);
    });

    it('disables Save when the user returns to the saved option', () => {
        // Given: a different option has been staged.
        render(<Page {...props} />);
        selectOption(SECOND_OPTION);

        // When: the original option is selected again.
        selectOption(SAVED_OPTION);
        saveSelection();

        // Then: restoring the original value does not cause a write or navigation.
        expect(getSelectionScreenProps().confirmButtonOptions?.isDisabled).toBe(true);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('discards unsaved selection when leaving and reopening', () => {
        // Given: a changed selection has not been saved.
        const page = render(<Page {...props} />);
        selectOption(SECOND_OPTION);

        // When: Back closes the page and the picker is opened again.
        act(() => getSelectionScreenProps().onBackButtonPress?.());
        page.unmount();
        render(<Page {...props} />);

        // Then: the saved option is selected and no mutation was made.
        expect(onBack).toHaveBeenCalledTimes(1);
        expect(onSelect).not.toHaveBeenCalled();
        expect(getSelectionScreenProps().data.filter((option) => option.isSelected)).toEqual([SAVED_OPTION]);
        expect(getSelectionScreenProps().confirmButtonOptions?.isDisabled).toBe(true);
    });

    it('uses asynchronously arriving options without manufacturing a selection', () => {
        // Given: the list has not loaded yet.
        const page = render(
            <Page
                {...props}
                data={[]}
            />,
        );
        expect(getSelectionScreenProps().confirmButtonOptions?.showButton).toBe(false);

        // When: the connection data arrives.
        page.rerender(<Page {...props} />);

        // Then: the persisted selection is displayed without being frozen to the empty initial data.
        expect(getSelectionScreenProps().data.filter((option) => option.isSelected)).toEqual([SAVED_OPTION]);
        expect(getSelectionScreenProps().confirmButtonOptions?.isDisabled).toBe(true);
    });

    it('does not save a draft removed from the current options', () => {
        // Given: a row has been staged.
        const page = render(<Page {...props} />);
        selectOption(SECOND_OPTION);

        // When: refreshed connection data removes that row before Save.
        page.rerender(
            <Page
                {...props}
                data={[SAVED_OPTION]}
            />,
        );
        saveSelection();

        // Then: the outdated selection cannot be committed.
        expect(getSelectionScreenProps().confirmButtonOptions?.isDisabled).toBe(true);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it.each([{isDisabled: true}, {isInteractive: false}])('does not save a draft that becomes unavailable: %j', (flags) => {
        // Given: a row was available when staged.
        const page = render(<Page {...props} />);
        selectOption(SECOND_OPTION);

        // When: the row is no longer selectable before Save.
        page.rerender(
            <Page
                {...props}
                data={[SAVED_OPTION, {...SECOND_OPTION, ...flags}]}
            />,
        );
        saveSelection();

        // Then: the latest availability prevents a mutation.
        expect(getSelectionScreenProps().confirmButtonOptions?.isDisabled).toBe(true);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('uses the current original row and callback on Save', () => {
        // Given: a row has been staged before the connection data refreshes.
        const page = render(<Page {...props} />);
        selectOption(SECOND_OPTION);
        const updatedOption = {...SECOND_OPTION, text: 'Updated name'};
        const updatedOnSelect = jest.fn<void, [SelectorType]>();

        // When: refreshed data and a new action callback arrive before confirmation.
        page.rerender(
            <Page
                {...props}
                data={[SAVED_OPTION, updatedOption]}
                onSelect={updatedOnSelect}
            />,
        );
        saveSelection();

        // Then: Save does not use an outdated row object or closure.
        expect(updatedOnSelect.mock.calls.at(0)?.at(0)).toBe(updatedOption);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('accepts an empty string value when the list explicitly provides it', () => {
        // Given: the data includes an explicit clearing option rather than an absent draft.
        const emptyOption = {...SECOND_OPTION, value: '', keyForList: 'none'};
        render(
            <Page
                {...props}
                data={[SAVED_OPTION, emptyOption]}
            />,
        );

        // When: that option is selected and saved.
        selectOption(emptyOption);
        saveSelection();

        // Then: the empty value is preserved in the original row passed to the action.
        expect(onSelect.mock.calls.at(0)?.at(0)).toBe(emptyOption);
    });

    it('preserves pending errors, access restrictions and close handling', () => {
        // Given: the caller supplies integration-specific feedback and access restrictions.
        const errors = {connectionError: 'Connection error'};
        const accessVariants = [CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID];

        // When: the shared picker renders.
        render(
            <Page
                {...props}
                pendingAction="update"
                errors={errors}
                accessVariants={accessVariants}
            />,
        );
        act(() => getSelectionScreenProps().onClose?.());

        // Then: staging does not replace any of the existing feedback or access props.
        expect(getSelectionScreenProps()).toEqual(expect.objectContaining({pendingAction: 'update', errors, accessVariants, onBackButtonPress: onBack}));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onSelect).not.toHaveBeenCalled();
    });
});
