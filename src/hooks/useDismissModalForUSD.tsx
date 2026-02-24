import type {Dispatch, SetStateAction} from 'react';
import {useState} from 'react';
import CONST from '@src/CONST';

function useDismissModalForUSD(workspaceCurrency: string | undefined): [isCurrencyModalOpen: boolean, setIsCurrencyModalOpen: Dispatch<SetStateAction<boolean>>] {
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [prevCurrency, setPrevCurrency] = useState(workspaceCurrency);
    if (prevCurrency !== workspaceCurrency) {
        setPrevCurrency(workspaceCurrency);
        if (isCurrencyModalOpen && workspaceCurrency === CONST.CURRENCY.USD) {
            setIsCurrencyModalOpen(false);
        }
    }

    return [isCurrencyModalOpen, setIsCurrencyModalOpen];
}

export default useDismissModalForUSD;
