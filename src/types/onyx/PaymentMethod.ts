import {SvgProps} from 'react-native-svg';
import BankAccount from './BankAccount';
import Fund from './Fund';

type PaymentMethod = (BankAccount | Fund) & {
    description: string;
    icon: React.FC<SvgProps>;
    iconSize?: number;
};

export default PaymentMethod;
