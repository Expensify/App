import isEmpty from 'lodash/isEmpty';
import {useEffect} from 'react';

const useAutoUpdateSelectedOptions = (availableOptions: string[], selectedOptions: Record<string, boolean> | string[], setSelectedOptions: (newSelectedOptions: string[]) => void) => {
    useEffect(() => {
        if (isEmpty(selectedOptions)) {
            return;
        }
        const originalSelectedOptions = Array.isArray(selectedOptions) ? selectedOptions : Object.keys(selectedOptions).filter((key) => selectedOptions[key]);
        const newSelectedOptions = originalSelectedOptions.filter((o) => availableOptions.includes(o));
        setSelectedOptions(newSelectedOptions);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [availableOptions]);
};
export default useAutoUpdateSelectedOptions;
