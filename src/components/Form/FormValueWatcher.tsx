import {useEffect, useRef} from 'react';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {FormOnyxValues} from './types';

type FormValueWatcherProps<TFormID extends OnyxFormKey> = {
    /** Form values to watch - the `inputValues` exposed by FormProvider's render prop. */
    values: FormOnyxValues<TFormID>;

    /**
     * Fires when the `values` prop reference changes.
     * Receives the new values and the previous values for direct comparison.
     */
    onValuesChange: (current: FormOnyxValues<TFormID>, previous: FormOnyxValues<TFormID>) => void;
};

/**
 * Render-null primitive that observes a `values` object and fires `onValuesChange` with `(current, previous)`
 * whenever the reference changes. Opt-in: only consumers who render it pay the cost.
 *
 * Designed to live inside `FormProvider`'s render prop so consumers can react to draft-driven updates
 * (e.g. from an RHP picker page) without having to wire up their own previous-value ref + effect.
 */
function FormValueWatcher<TFormID extends OnyxFormKey>({values, onValuesChange}: FormValueWatcherProps<TFormID>) {
    const previousValuesRef = useRef(values);
    useEffect(() => {
        if (previousValuesRef.current === values) {
            return;
        }
        const previous = previousValuesRef.current;
        previousValuesRef.current = values;
        onValuesChange(values, previous);
    }, [values, onValuesChange]);
    return null;
}

FormValueWatcher.displayName = 'FormValueWatcher';

export default FormValueWatcher;
