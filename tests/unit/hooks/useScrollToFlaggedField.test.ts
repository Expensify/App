import {act, renderHook} from '@testing-library/react-native';

import useScrollToFlaggedField from '@components/MoneyRequestConfirmationList/hooks/useScrollToFlaggedField';
import type {SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import type {View} from 'react-native';

import createMock from '../../utils/createMock';

function renderWithMerchantView(transactionIDOnScreen: string) {
    const scrollToReveal = jest.fn();
    const listRef = {current: createMock<SelectionListWithSectionsHandle>({scrollToReveal})};
    const {result, rerender} = renderHook(({transactionID}: {transactionID: string}) => useScrollToFlaggedField(listRef, transactionID), {
        initialProps: {transactionID: transactionIDOnScreen},
    });
    const merchantView = createMock<View>({});
    result.current.fieldViewRefs.merchant.current = merchantView;
    return {result, rerender, scrollToReveal, merchantView};
}

describe('useScrollToFlaggedField', () => {
    it('scrolls the list to the view of the flagged field, and again every time a confirm is blocked by it', () => {
        // Given a confirmation whose merchant field has attached its outer view
        const {result, scrollToReveal, merchantView} = renderWithMerchantView('txn1');

        // When a blocked confirm flags the merchant, and a second confirm flags it again
        act(() => result.current.scrollToField('merchant', 'txn1'));
        act(() => result.current.scrollToField('merchant', 'txn1'));

        // Then the list scrolls to the merchant's view both times, so a repeated confirm still brings its error into view
        expect(scrollToReveal).toHaveBeenCalledTimes(2);
        expect(scrollToReveal).toHaveBeenLastCalledWith(merchantView);
    });

    it('waits for the flagged receipt to be on screen before scrolling, and only scrolls once for it', () => {
        // Given a multi-scan whose blocked confirm flagged the merchant of another receipt, while the pager still shows the previous receipt
        const {result, rerender, scrollToReveal, merchantView} = renderWithMerchantView('txn1');
        act(() => result.current.scrollToField('merchant', 'txn2'));

        // Then nothing scrolls yet, since the merchant view still belongs to the previous receipt
        expect(scrollToReveal).not.toHaveBeenCalled();

        // When the flagged receipt comes on screen
        rerender({transactionID: 'txn2'});

        // Then the list scrolls to its merchant
        expect(scrollToReveal).toHaveBeenCalledTimes(1);
        expect(scrollToReveal).toHaveBeenLastCalledWith(merchantView);

        // When the user pages away and back to that receipt without confirming again
        rerender({transactionID: 'txn1'});
        rerender({transactionID: 'txn2'});

        // Then the list stays where the user left it
        expect(scrollToReveal).toHaveBeenCalledTimes(1);
    });
});
