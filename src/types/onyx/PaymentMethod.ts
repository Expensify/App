import type {StyleProp, ViewStyle} from 'react-native';
import type IconAsset from '@src/types/utils/IconAsset';
import type BankAccount from './BankAccount';
import type Fund from './Fund';

/** Model of a payment method */
type PaymentMethod = (BankAccount | Fund) & {
    /** Text shown under menu item title */
    description: string;

    /** Source of the menu item icon, which can be a component or an image asset */
    icon: IconAsset;

    /** Size of the menu item icon */
    iconSize?: number;

    /** Height of the menu item icon */
    iconHeight?: number;

    /** Width of the menu item icon */
    iconWidth?: number;

    /** Icon wrapper styles */
    iconStyles?: StyleProp<ViewStyle>;
};

export default PaymentMethod;
