// This file contains all the SVG imports for illustrations used in the app
// Company Cards
import type {SvgProps} from 'react-native-svg';
import CompanyCardsEmptyState from '@assets/images/companyCards/emptystate__card-pos.svg';
// Other assets
import Computer from '@assets/images/computer.svg';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
// Expensify Card
import ExpensifyCardIllustration from '@assets/images/expensifyCard/cardIllustration.svg';
import LaptopWithSecondScreenSync from '@assets/images/laptop-with-second-screen-sync.svg';
import LaptopWithSecondScreenX from '@assets/images/laptop-with-second-screen-x.svg';
// Product Illustrations
import TeleScope from '@assets/images/product-illustrations/telescope.svg';
// Simple Illustrations - Core ones that are actually used
import Accounting from '@assets/images/simple-illustrations/simple-illustration__accounting.svg';
import BlueShield from '@assets/images/simple-illustrations/simple-illustration__blueshield.svg';
import Building from '@assets/images/simple-illustrations/simple-illustration__building.svg';
import CarIce from '@assets/images/simple-illustrations/simple-illustration__car-ice.svg';
import Coins from '@assets/images/simple-illustrations/simple-illustration__coins.svg';
import CreditCardsNew from '@assets/images/simple-illustrations/simple-illustration__credit-cards.svg';
import FolderOpen from '@assets/images/simple-illustrations/simple-illustration__folder-open.svg';
import HandCard from '@assets/images/simple-illustrations/simple-illustration__handcard.svg';
import InvoiceBlue from '@assets/images/simple-illustrations/simple-illustration__invoice.svg';
import Luggage from '@assets/images/simple-illustrations/simple-illustration__luggage.svg';
import MagnifyingGlassMoney from '@assets/images/simple-illustrations/simple-illustration__magnifyingglass-money.svg';
import MoneyReceipts from '@assets/images/simple-illustrations/simple-illustration__money-receipts.svg';
import MoneyWings from '@assets/images/simple-illustrations/simple-illustration__moneywings.svg';
import Pencil from '@assets/images/simple-illustrations/simple-illustration__pencil.svg';
import PerDiem from '@assets/images/simple-illustrations/simple-illustration__perdiem.svg';
import ReceiptWrangler from '@assets/images/simple-illustrations/simple-illustration__receipt-wrangler.svg';
import ReportReceipt from '@assets/images/simple-illustrations/simple-illustration__report-receipt.svg';
import Rules from '@assets/images/simple-illustrations/simple-illustration__rules.svg';
import Tag from '@assets/images/simple-illustrations/simple-illustration__tag.svg';
import CompanyCard from '@assets/images/simple-illustrations/simple-illustration__twocards-horizontal.svg';
import Workflows from '@assets/images/simple-illustrations/simple-illustration__workflows.svg';

// Create the illustrations object with all imported illustrations
const Illustrations = {
    // Company Cards
    CompanyCardsEmptyState,

    // Other assets
    Computer,
    ExpensifyCardImage,
    LaptopWithSecondScreenSync,
    LaptopWithSecondScreenX,

    // Expensify Card
    ExpensifyCardIllustration,

    // Product Illustrations
    TeleScope,
    Telescope: TeleScope, // Alias for consistency

    // Simple Illustrations
    Accounting,
    Building,
    Coins,
    CreditCardsNew,
    FolderOpen,
    HandCard,
    InvoiceBlue,
    MagnifyingGlassMoney,
    MoneyReceipts,
    MoneyWings,
    PerDiem,
    ReceiptWrangler,
    ReportReceipt,
    Rules,
    Tag,
    CompanyCard,
    Workflows,
    CarIce,
    BlueShield,
    Pencil,
    Luggage,
    // Legacy aliases for compatibility
    Car: CompanyCard, // Fallback for Car illustration requests
};

/**
 * Get an illustration by name
 * @param illustrationName - The name of the illustration to retrieve
 * @returns The illustration component or undefined if not found
 */
function getIllustration(illustrationName: IllustrationName): React.FC<SvgProps> {
    return Illustrations[illustrationName];
}
/**
 * Get all available illustration names
 * @returns Array of available illustration names
 */
const AVAILABLE_ILLUSTRATIONS = Object.keys(Illustrations);

/**
 * Type representing all available illustration names
 */
type IllustrationName = keyof typeof Illustrations;

export default Illustrations;
export {getIllustration, AVAILABLE_ILLUSTRATIONS};
export type {IllustrationName};
