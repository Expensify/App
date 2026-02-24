import type {Dispatch, SetStateAction} from 'react';
import {useState} from 'react';
import CONST from '@src/CONST';

function useDismissModalForUSD(workspaceCurrency: string | undefined): [isCurrencyModalOpen: boolean, setIsCurrencyModalOpen: Dispatch<SetStateAction<boolean>>] {
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    return [isCurrencyModalOpen && workspaceCurrency !== CONST.CURRENCY.USD, setIsCurrencyModalOpen];
}

export default useDismissModalForUSD;
