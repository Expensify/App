import {SvgProps} from 'react-native-svg';
import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
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
// Card Icons
import AmericanExpressCard from '../../../assets/images/cardicons/american-express.svg';
import BankOfAmericaCard from '../../../assets/images/cardicons/bank-of-america.svg';
import BB_TCard from '../../../assets/images/cardicons/bb-t.svg';
import CapitalOneCard from '../../../assets/images/cardicons/capital-one.svg';
import CharlesSchwabCard from '../../../assets/images/cardicons/charles-schwab.svg';
import ChaseCard from '../../../assets/images/cardicons/chase.svg';
import CitiBankCard from '../../../assets/images/cardicons/citibank.svg';
import CitizensBankCard from '../../../assets/images/cardicons/citizens.svg';
import DiscoverCard from '../../../assets/images/cardicons/discover.svg';
import FidelityCard from '../../../assets/images/cardicons/fidelity.svg';
import HuntingtonBankCard from '../../../assets/images/cardicons/huntington-bank.svg';
import GenericBankCard from '../../../assets/images/cardicons/generic-bank-card.svg';
import NavyFederalCreditUnionCard from '../../../assets/images/cardicons/navy-federal-credit-union.svg';
import PNCCard from '../../../assets/images/cardicons/pnc.svg';
import RegionsBankCard from '../../../assets/images/cardicons/regions-bank.svg';
import SunTrustCard from '../../../assets/images/cardicons/suntrust.svg';
import TdBankCard from '../../../assets/images/cardicons/td-bank.svg';
import USBankCard from '../../../assets/images/cardicons/us-bank.svg';
import USAACard from '../../../assets/images/cardicons/usaa.svg';
import ExpensifyCardImage from '../../../assets/images/cardicons/expensify-card-dark.svg';
import styles from '../../styles/styles';
import variables from '../../styles/variables';

type BankIcon = {
    icon: React.FC<SvgProps>;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: Array<ViewStyle | CSSProperties>;
};

/**
 * Returns matching asset icon for bankName
 */

function getAssetIcon(bankName: string, isCard: boolean): React.FC<SvgProps> {
    if (bankName.includes('expensify')) {
        return ExpensifyCardImage;
    }

    if (bankName.includes('americanexpress')) {
        return isCard ? AmericanExpressCard : AmericanExpress;
    }

    if (bankName.includes('bank of america') || bankName.includes('bankofamerica')) {
        return isCard ? BankOfAmericaCard : BankOfAmerica;
    }

    if (bankName.startsWith('bbt')) {
        return isCard ? BB_TCard : BB_T;
    }

    if (bankName.startsWith('capital one') || bankName.includes('capitalone')) {
        return isCard ? CapitalOneCard : CapitalOne;
    }

    if (bankName.startsWith('chase') || bankName.includes('chase')) {
        return isCard ? ChaseCard : Chase;
    }

    if (bankName.includes('charles schwab') || bankName.includes('charlesschwab')) {
        return isCard ? CharlesSchwabCard : CharlesSchwab;
    }

    if (bankName.startsWith('citibank') || bankName.includes('citibank')) {
        return isCard ? CitiBankCard : CitiBank;
    }

    if (bankName.startsWith('citizens bank') || bankName.includes('citizensbank')) {
        return isCard ? CitizensBankCard : CitizensBank;
    }

    if (bankName.startsWith('discover ') || bankName.includes('discover.') || bankName === 'discover') {
        return isCard ? DiscoverCard : Discover;
    }

    if (bankName.startsWith('fidelity')) {
        return isCard ? FidelityCard : Fidelity;
    }

    if (bankName.startsWith('huntington bank') || bankName.includes('huntingtonnational') || bankName.includes('huntington national')) {
        return isCard ? HuntingtonBankCard : HuntingtonBank;
    }

    if (bankName.startsWith('navy federal credit union') || bankName.includes('navy federal credit union')) {
        return isCard ? NavyFederalCreditUnionCard : NavyFederalCreditUnion;
    }

    if (bankName.startsWith('pnc') || bankName.includes('pnc')) {
        return isCard ? PNCCard : PNC;
    }

    if (bankName.startsWith('regions bank') || bankName.includes('regionsbank')) {
        return isCard ? RegionsBankCard : RegionsBank;
    }

    if (bankName.startsWith('suntrust') || bankName.includes('suntrust')) {
        return isCard ? SunTrustCard : SunTrust;
    }

    if (bankName.startsWith('td bank') || bankName.startsWith('tdbank') || bankName.includes('tdbank')) {
        return isCard ? TdBankCard : TdBank;
    }

    if (bankName.startsWith('us bank') || bankName.startsWith('usbank')) {
        return isCard ? USBankCard : USBank;
    }

    if (bankName.includes('usaa')) {
        return isCard ? USAACard : USAA;
    }

    return isCard ? GenericBankCard : GenericBank;
}

/**
 * Returns Bank Icon Object that matches to existing bank icons or default icons
 */

export default function getBankIcon(bankName: string, isCard = false): BankIcon {
    const bankIcon: BankIcon = {
        icon: isCard ? GenericBankCard : GenericBank,
    };

    if (bankName) {
        bankIcon.icon = getAssetIcon(bankName.toLowerCase(), isCard);
    }

    // For default Credit Card icon the icon size should not be set.
    if (!isCard) {
        bankIcon.iconSize = variables.iconSizeExtraLarge;
        bankIcon.iconStyles = [styles.bankIconContainer];
    } else {
        bankIcon.iconHeight = variables.bankCardHeight;
        bankIcon.iconWidth = variables.bankCardWidth;
        bankIcon.iconStyles = [styles.assignedCardsIconContainer];
    }

    return bankIcon;
}
