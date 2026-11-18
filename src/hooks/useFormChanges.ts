/** Track edits from forms that keep values locally instead of writing a resumable draft. */
import hasFormChanges from '@libs/hasFormChanges';

import {useState} from 'react';

type FormChanges = {
    initialValues: Record<string, unknown>;
    edits: Record<string, unknown>;
};

function useFormChanges(initialValues: Record<string, unknown>) {
    const [changes, setChanges] = useState<FormChanges>();
    const recordChange = (value: unknown, key: string) => {
        // Defaults can arrive asynchronously. Freeze them when editing begins rather than while the screen is loading.
        setChanges((previous) => ({initialValues: previous?.initialValues ?? initialValues, edits: {...previous?.edits, [key]: value}}));
    };
    return {recordChange, getHasUnsavedChanges: () => !!changes && hasFormChanges(changes.edits, changes.initialValues)};
}

export default useFormChanges;
