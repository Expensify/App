import {useCallback, useEffect, useRef} from 'react';
import {closeImportPage} from '@libs/actions/ImportSpreadsheet';

function useCloseImportPage() {
    const isClosing = useRef(false);

    const setIsClosing = useCallback((value: boolean) => {
        isClosing.current = value;
    }, []);

    useEffect(() => {
        return () => {
            if (!isClosing.current) {
                return;
            }
            closeImportPage();
        };
    }, []);

    return {setIsClosing};
}

export default useCloseImportPage;
