import type {GestureResponderEvent} from 'react-native';
import type {FormattedSelectedPaymentMethodIcon} from '@hooks/usePaymentMethodState/types';
import type {AccountData, Card} from '@src/types/onyx';

type PaymentMethodPressHandlerParams = {
    event?: GestureResponderEvent | KeyboardEvent;
    accountType?: string;
    accountData?: AccountData;
    icon?: FormattedSelectedPaymentMethodIcon;
    isDefault?: boolean;
    methodID?: number;
    description?: string;
};

type CardPressHandlerParams = {
    event?: GestureResponderEvent | KeyboardEvent;
    cardData?: Card;
    icon?: FormattedSelectedPaymentMethodIcon;
    cardID?: number;
};

export type {PaymentMethodPressHandlerParams, CardPressHandlerParams};
