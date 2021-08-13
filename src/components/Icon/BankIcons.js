import DefaultBank from '../../../assets/images/bank.svg';
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
import NavyFederalCreditUnion from '../../../assets/images/bankicons/navy-federal-credit-union.svg';
import PNC from '../../../assets/images/bankicons/pnc.svg';
import RegionsBank from '../../../assets/images/bankicons/regions-bank.svg';
import SunTrust from '../../../assets/images/bankicons/suntrust.svg';
import TdBank from '../../../assets/images/bankicons/td-bank.svg';
import USBank from '../../../assets/images/bankicons/us-bank.svg';
import USAA from '../../../assets/images/bankicons/usaa.svg';

/**
 * Returns matching asset icon for bankName
 * @param {String} bankName
 * @returns
 */

function getAssetIcon(bankName) {
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

    return DefaultBank;
}

/**
* Returns Bank Icon that matches to existing bank icons or default Icon
* @param {String} bankName
* @returns
*/

export default function getBankIcon(bankName) {
    if (!bankName) {
        return DefaultBank;
    }

    return getAssetIcon(bankName.toLowerCase());
}
