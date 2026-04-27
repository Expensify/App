import React, {createContext, useContext} from 'react';
import usePaymentAnimations from '@hooks/usePaymentAnimations';

type PaymentAnimationsContextType = ReturnType<typeof usePaymentAnimations>;

const PaymentAnimationsContext = createContext<PaymentAnimationsContextType | null>(null);

function usePaymentAnimationsContext(): PaymentAnimationsContextType {
    const context = useContext(PaymentAnimationsContext);
    if (!context) {
        throw new Error('usePaymentAnimationsContext must be used within a PaymentAnimationsProvider');
    }
    return context;
}

function PaymentAnimationsProvider({children}: {children: React.ReactNode}) {
    const animations = usePaymentAnimations();
    return <PaymentAnimationsContext.Provider value={animations}>{children}</PaymentAnimationsContext.Provider>;
}

export {PaymentAnimationsProvider, usePaymentAnimationsContext};
