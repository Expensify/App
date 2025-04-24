import type {Dispatch, SetStateAction} from 'react';
import {useEffect, useState} from 'react';
import CONST from '@src/CONST';

function useDismissModalForUSD(workspaceCurrency: string | undefined): [isCurrencyModalOpen: boolean, setIsCurrencyModalOpen: Dispatch<SetStateAction<boolean>>] {
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

    useEffect(() => {
        if (!isCurrencyModalOpen || workspaceCurrency !== CONST.CURRENCY.USD) {
            return;
        }

        setIsCurrencyModalOpen(false);
    }, [workspaceCurrency, isCurrencyModalOpen, setIsCurrencyModalOpen]);

    return [isCurrencyModalOpen, setIsCurrencyModalOpen];
}

export default useDismissModalForUSD;
