import {useEffect, useState} from 'react';

function usePersistSelection<TKey extends string | number, TValue>(options: Record<TKey, TValue> | undefined, filter: (option: TValue | undefined) => boolean) {
    const [selectedOptions, setSelectedOptions] = useState<TKey[]>([]);

    useEffect(() => setSelectedOptions((prevOptions) => prevOptions.filter((key) => filter(options?.[key]))), [options, filter]);

    return [selectedOptions, setSelectedOptions] as const;
}

export default usePersistSelection;
