import {setDraftValues} from '@userActions/FormActions';

import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {DynamicFormField} from '@src/types/onyx';

import {useEffect, useRef} from 'react';

import type {DynamicFormValues} from './types';

const REFRESH_DEBOUNCE_MS = 300;

type UseRefreshOnChangeParams = {
    fields: DynamicFormField[];

    /** Current answers; the draft for `formID` */
    values: DynamicFormValues;

    /** Re-fetches the schema with the current answers */
    fetch: (values: DynamicFormValues) => void;

    formID: OnyxFormKey;

    /** The sub page (group name) the user is on, re-entered after the schema is replaced */
    currentPageName?: string;

    resetToPage?: (pageName?: string) => void;
};

function useRefreshOnChange({fields, values, fetch, formID, currentPageName, resetToPage}: UseRefreshOnChangeParams) {
    const refreshSignature = JSON.stringify(fields.filter((field) => field.refreshOnChange).map((field) => [field.key, values[field.key]]));
    const schemaSignature = fields.map((field) => field.key).join('\n');

    const latest = useRef({fields, values, fetch, currentPageName, resetToPage});
    useEffect(() => {
        latest.current = {fields, values, fetch, currentPageName, resetToPage};
    });

    const previousRefreshSignature = useRef(refreshSignature);
    useEffect(() => {
        if (previousRefreshSignature.current === refreshSignature) {
            return;
        }
        previousRefreshSignature.current = refreshSignature;
        const timeout = setTimeout(() => latest.current.fetch(latest.current.values), REFRESH_DEBOUNCE_MS);
        return () => clearTimeout(timeout);
    }, [refreshSignature]);

    const previousKeys = useRef(fields.map((field) => field.key));
    useEffect(() => {
        const {fields: currentFields, currentPageName: pageName, resetToPage: reset} = latest.current;
        const currentKeys = currentFields.map((field) => field.key);
        if (previousKeys.current.join('\n') === schemaSignature) {
            return;
        }
        const removedKeys = previousKeys.current.filter((key) => !currentKeys.includes(key));
        previousKeys.current = currentKeys;

        if (removedKeys.length > 0) {
            setDraftValues(formID, Object.fromEntries(removedKeys.map((key) => [key, null])));
        }

        const isCurrentPageStillPresent = !!pageName && currentFields.some((field) => field.group === pageName);
        reset?.(isCurrentPageStillPresent ? pageName : undefined);
    }, [schemaSignature, formID]);
}

export default useRefreshOnChange;
export {REFRESH_DEBOUNCE_MS};
