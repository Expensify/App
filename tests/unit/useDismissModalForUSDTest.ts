import {renderHook} from '@testing-library/react-native';
import useDismissModalForUSD from '@hooks/useDismissModalForUSD';
import CONST from '@src/CONST';

describe('useDismissModalForUSD', () => {
    it('useDismissModalForUSD should dismiss currency modal when the currency changes to USD', () => {
        const {rerender, result} = renderHook(({workspaceCurrency = CONST.CURRENCY.EUR}: {workspaceCurrency?: string | undefined}) => useDismissModalForUSD(workspaceCurrency), {
            initialProps: {},
        });
        // Open the currency modal
        result.current[1](true);

        // When currency is updated to USD
        rerender({workspaceCurrency: CONST.CURRENCY.USD});

        // Then the isCurrencyModalOpen state should be false
        expect(result.current[0]).toBe(false);
    });
});
