// This file contains all the SVG imports for illustrations used in the app
// Company Cards
import type {SvgProps} from 'react-native-svg';
import CompanyCardsEmptyState from '@assets/images/companyCards/emptystate__card-pos.svg';
import PendingBank from '@assets/images/companyCards/pending-bank.svg';
import CompanyCardsPendingState from '@assets/images/companyCards/pendingstate_laptop-with-hourglass-and-cards.svg';
// Other assets
import Computer from '@assets/images/computer.svg';
// Educational Illustrations
import MultiScan from '@assets/images/educational-illustration__multi-scan.svg';
import EmptyCardState from '@assets/images/emptystate__expensifycard.svg';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
// Expensify Card
import ExpensifyCardIllustration from '@assets/images/expensifyCard/cardIllustration.svg';
// Other Images
import Hand from '@assets/images/hand.svg';
import LaptopWithSecondScreenAndHourglass from '@assets/images/laptop-with-second-screen-and-hourglass.svg';
import LaptopWithSecondScreenSync from '@assets/images/laptop-with-second-screen-sync.svg';
import LaptopWithSecondScreenX from '@assets/images/laptop-with-second-screen-x.svg';
// Product Illustrations
import TeleScope from '@assets/images/product-illustrations/telescope.svg';
import ToddBehindCloud from '@assets/images/product-illustrations/todd-behind-cloud.svg';
import ReceiptUpload from '@assets/images/receipt-upload.svg';
import RunningTurtle from '@assets/images/running-turtle.svg';
import Shutter from '@assets/images/shutter.svg';
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
import LockClosedOrange from '@assets/images/simple-illustrations/simple-illustration__lockclosed_orange.svg';
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
import ExpensifyApprovedLogo from '@assets/images/subscription-details__approvedlogo.svg';
import TurtleInShell from '@assets/images/turtle-in-shell.svg';

// Create the illustrations object with all imported illustrations
const Illustrations = {
    // Company Cards
    CompanyCardsEmptyState,
    CompanyCardsPendingState,
    PendingBank,

    // Other assets
    Computer,
    EmptyCardState,
    ExpensifyCardImage,
    LaptopWithSecondScreenAndHourglass,
    LaptopWithSecondScreenSync,
    LaptopWithSecondScreenX,

    // Expensify Card
    ExpensifyCardIllustration,

    // Product Illustrations
    TeleScope,
    Telescope: TeleScope, // Alias for consistency
    ToddBehindCloud,

    // Educational Illustrations
    MultiScan,

    // Other Images
    Hand,
    ReceiptUpload,
    RunningTurtle,
    Shutter,
    ExpensifyApprovedLogo,
    TurtleInShell,

    // Simple Illustrations
    Accounting,
    Building,
    Coins,
    CreditCardsNew,
    FolderOpen,
    HandCard,
    InvoiceBlue,
    LockClosedOrange,
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
