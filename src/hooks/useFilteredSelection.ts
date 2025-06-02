import {useEffect, useState} from 'react';

/**
 * Custom hook to manage a selection of keys from a given set of options.
 * It filters the selected keys based on a provided filter function whenever the options or the filter change.
 *
 * @param options - Option data
 * @param filter - Filter function
 * @returns A tuple containing the array of selected keys and a function to update the selected keys.
 */
function useFilteredSelection<TKey extends string | number, TValue>(options: Record<TKey, TValue> | undefined, filter: (option: TValue | undefined) => boolean) {
    const [selectedOptions, setSelectedOptions] = useState<TKey[]>([]);

    useEffect(() => setSelectedOptions((prevOptions) => prevOptions.filter((key) => filter(options?.[key]))), [options, filter]);

    return [selectedOptions, setSelectedOptions] as const;
}

export default useFilteredSelection;
