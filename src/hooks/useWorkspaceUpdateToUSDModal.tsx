import type {Dispatch, SetStateAction} from 'react';
import {useEffect} from 'react';
import CONST from '@src/CONST';

function useWorkspaceUpdateToUSDModal(isCurrencyModalOpen: boolean, setIsCurrencyModalOpen: Dispatch<SetStateAction<boolean>>, workspaceCurrency: string | undefined) {
    useEffect(() => {
        if (!isCurrencyModalOpen || workspaceCurrency !== CONST.CURRENCY.USD) {
            return;
        }

        setIsCurrencyModalOpen(false);
    }, [workspaceCurrency, isCurrencyModalOpen, setIsCurrencyModalOpen]);

    return [isCurrencyModalOpen, setIsCurrencyModalOpen];
}

export default useWorkspaceUpdateToUSDModal;
