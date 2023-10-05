import {SvgProps} from 'react-native-svg';
import * as Expensicons from './Expensicons';
import AmericanExpress from '../../../assets/images/bankicons/american-express.svg';
import BankOfAmerica from '../../../assets/images/bankicons/bank-of-america.svg';
import BB_T from '../../../assets/images/bankicons/bb-t.svg';
import CapitalOne from '../../../assets/images/bankicons/capital-one.svg';
import CharlesSchwab from '../../../assets/images/bankicons/charles-schwab.svg';
import Chase from '../../../assets/images/bankicons/chase.svg';
import CitiBank from '../../../assets/images/bankicons/citibank.svg';
import CitizensBank from '../../../assets/images/bankicons/citizens-bank.svg';
import Discover from '../../../assets/images/bankicons/discover.svg';
import Fidelity from '../../../assets/images/bankicons/fidelity.svg';
import HuntingtonBank from '../../../assets/images/bankicons/huntington-bank.svg';
import GenericBank from '../../../assets/images/bankicons/generic-bank-account.svg';
import NavyFederalCreditUnion from '../../../assets/images/bankicons/navy-federal-credit-union.svg';
import PNC from '../../../assets/images/bankicons/pnc.svg';
import RegionsBank from '../../../assets/images/bankicons/regions-bank.svg';
import SunTrust from '../../../assets/images/bankicons/suntrust.svg';
import TdBank from '../../../assets/images/bankicons/td-bank.svg';
import USBank from '../../../assets/images/bankicons/us-bank.svg';
import USAA from '../../../assets/images/bankicons/usaa.svg';
import variables from '../../styles/variables';

type BankIcon = {
    icon: React.FC<SvgProps>;
    iconSize?: number;
};

/**
 * Returns matching asset icon for bankName
 */

function getAssetIcon(bankName: string, isCard: boolean): React.FC<SvgProps> {
    if (bankName.includes('americanexpress')) {
        return AmericanExpress;
    }

    if (bankName.includes('bank of america') || bankName.includes('bankofamerica')) {
        return BankOfAmerica;
    }

    if (bankName.startsWith('bbt')) {
        return BB_T;
    }

    if (bankName.startsWith('capital one') || bankName.includes('capitalone')) {
        return CapitalOne;
    }

    if (bankName.startsWith('chase') || bankName.includes('chase')) {
        return Chase;
    }

    if (bankName.includes('charles schwab') || bankName.includes('charlesschwab')) {
        return CharlesSchwab;
    }

    if (bankName.startsWith('citibank') || bankName.includes('citibank')) {
        return CitiBank;
    }

    if (bankName.startsWith('citizens bank') || bankName.includes('citizensbank')) {
        return CitizensBank;
    }

    if (bankName.startsWith('discover ') || bankName.includes('discover.') || bankName === 'discover') {
        return Discover;
    }

    if (bankName.startsWith('fidelity')) {
        return Fidelity;
    }

    if (bankName.startsWith('huntington bank') || bankName.includes('huntingtonnational') || bankName.includes('huntington national')) {
        return HuntingtonBank;
    }

    if (bankName.startsWith('navy federal credit union') || bankName.includes('navy federal credit union')) {
        return NavyFederalCreditUnion;
    }

    if (bankName.startsWith('pnc') || bankName.includes('pnc')) {
        return PNC;
    }

    if (bankName.startsWith('regions bank') || bankName.includes('regionsbank')) {
        return RegionsBank;
    }

    if (bankName.startsWith('suntrust') || bankName.includes('suntrust')) {
        return SunTrust;
    }

    if (bankName.startsWith('td bank') || bankName.startsWith('tdbank') || bankName.includes('tdbank')) {
        return TdBank;
    }

    if (bankName.startsWith('us bank') || bankName.startsWith('usbank')) {
        return USBank;
    }

    if (bankName.includes('usaa')) {
        return USAA;
    }

    return isCard ? Expensicons.CreditCard : GenericBank;
}

/**
 * Returns Bank Icon Object that matches to existing bank icons or default icons
 */

export default function getBankIcon(bankName: string, isCard = false): BankIcon {
    const bankIcon: BankIcon = {
        icon: isCard ? Expensicons.CreditCard : GenericBank,
    };

    if (bankName) {
        bankIcon.icon = getAssetIcon(bankName.toLowerCase(), isCard);
    }

    // For default Credit Card icon the icon size should not be set.
    if (![Expensicons.CreditCard].includes(bankIcon.icon)) {
        bankIcon.iconSize = variables.iconSizeExtraLarge;
    }

    return bankIcon;
}
