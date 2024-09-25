import type {ViewStyle} from 'react-native';
import type IconAsset from '@src/types/utils/IconAsset';

type WalletPageProps = {
    /** Listen for window resize event on web and desktop. */
    shouldListenForResize?: boolean;
};

type FormattedSelectedPaymentMethodIcon = {
    icon: IconAsset;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: ViewStyle[];
    iconSize?: number;
};

export type {WalletPageProps, FormattedSelectedPaymentMethodIcon};
