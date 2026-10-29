import {useState} from 'react';

import type {PaymentMethodState} from './types';

const initialState: PaymentMethodState = {
    isSelectedPaymentMethodDefault: false,
    selectedPaymentMethod: {},
    formattedSelectedPaymentMethod: {
        title: '',
    },
    methodID: '',
    selectedPaymentMethodType: '',
};

function usePaymentMethodState() {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodState>(initialState);

    const resetSelectedPaymentMethodData = () => {
        setPaymentMethod(initialState);
    };

    return {
        paymentMethod,
        setPaymentMethod,
        resetSelectedPaymentMethodData,
    };
}

export default usePaymentMethodState;
