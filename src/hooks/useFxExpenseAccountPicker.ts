/**
 * Draft FX fee account selection shared by the accounting pickers, with a None row and a Save button.
 */
import type {SelectorType} from '@components/SelectionScreen';

import CONST from '@src/CONST';

import {useState} from 'react';

import useLocalize from './useLocalize';

function useFxExpenseAccountPicker(persistedAccount: string | undefined) {
    const {translate} = useLocalize();
    const persisted = persistedAccount ?? '';
    const [draftAccountID, setDraftAccountID] = useState<string>();
    const selectedAccountID = draftAccountID ?? persisted;
    const hasChanges = selectedAccountID !== persisted;

    const selectAccount = ({value}: SelectorType) => {
        setDraftAccountID(value);
    };

    const buildList = (accountOptions: SelectorType[], sourceAccountCount: number, onConfirm: () => void) => {
        // Don't prepend None onto an empty account list or the empty-state BlockingView never shows.
        const shouldShowNoneOption = sourceAccountCount > 0 || persisted.length > 0;
        const noneOption: SelectorType = {
            value: '',
            text: translate('common.none'),
            keyForList: CONST.SEARCH.NONE_OPTION_KEY,
            isSelected: !selectedAccountID,
        };
        const noneOptionKey = shouldShowNoneOption ? CONST.SEARCH.NONE_OPTION_KEY : undefined;

        return {
            // Search this list; None is a normal row so a miss does not leave it stuck on screen.
            searchableList: shouldShowNoneOption ? [noneOption, ...accountOptions] : accountOptions,
            initiallyFocusedOptionKey: persisted.length > 0 ? persisted : noneOptionKey,
            confirmButtonOptions: {
                showButton: shouldShowNoneOption,
                text: translate('common.save'),
                onConfirm,
                isDisabled: !hasChanges,
            },
        };
    };

    return {selectedAccountID, hasChanges, selectAccount, buildList};
}

export default useFxExpenseAccountPicker;
