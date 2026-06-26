import {closeImportPage} from '@libs/actions/ImportSpreadsheet';

import {useCallback, useEffect, useRef} from 'react';

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
