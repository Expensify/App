import type {ViewStyle} from 'react-native';
import type {AccountData} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type FormattedSelectedPaymentMethodIcon = {
    icon: IconAsset;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: ViewStyle[];
    iconSize?: number;
};

type FormattedSelectedPaymentMethod = {
    title: string;
    icon?: FormattedSelectedPaymentMethodIcon;
    description?: string;
    type?: string;
};

type PaymentMethodState = {
    isSelectedPaymentMethodDefault: boolean;
    selectedPaymentMethod: AccountData;
    formattedSelectedPaymentMethod: FormattedSelectedPaymentMethod;
    methodID: string | number;
    selectedPaymentMethodType: string;
};

export type {FormattedSelectedPaymentMethodIcon, FormattedSelectedPaymentMethod, PaymentMethodState};
