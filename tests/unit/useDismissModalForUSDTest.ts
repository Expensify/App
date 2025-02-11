import {renderHook} from '@testing-library/react-native';
import type {Dispatch, SetStateAction} from 'react';
import useDismissModalForUSD from '@hooks/useDismissModalForUSD';
import CONST from '@src/CONST';

describe('useDismissModalForUSD', () => {
    it('useDismissModalForUSD should dismiss currency modal when the currency changes to USD', () => {
        const setIsCurrencyModalOpenMock = jest.fn();

        const {rerender} = renderHook(
            ({
                isCurrencyModalOpen = true,
                setIsCurrencyModalOpen = setIsCurrencyModalOpenMock,
                workspaceCurrency = CONST.CURRENCY.EUR,
            }: {
                isCurrencyModalOpen?: boolean;
                setIsCurrencyModalOpen?: Dispatch<SetStateAction<boolean>>;
                workspaceCurrency?: string | undefined;
            }) => useDismissModalForUSD(isCurrencyModalOpen, setIsCurrencyModalOpen, workspaceCurrency),
            {initialProps: {}},
        );

        // When currency is updated to USD
        rerender({workspaceCurrency: CONST.CURRENCY.USD});

        // Then the isCurrencyModalOpen state should be set to false
        expect(setIsCurrencyModalOpenMock).toHaveBeenCalledWith(false);
    });
});
