/** Keep unsaved expense edits outside the nested form so synchronization can remount it without losing input. */
import {useState} from 'react';

type ExpenseFieldDraft = {
    transactionID: string;
    value: string;
};

function useExpenseFieldDraft(transactionID: string, storedValue: string): readonly [string, (value: string) => void] {
    const [draft, setDraft] = useState<ExpenseFieldDraft>();
    const value = draft?.transactionID === transactionID ? draft.value : storedValue;

    function updateDraft(value: string) {
        setDraft({transactionID, value});
    }

    return [value, updateDraft];
}

export default useExpenseFieldDraft;
