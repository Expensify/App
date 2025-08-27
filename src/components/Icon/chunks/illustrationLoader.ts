// Illustration Loader - Utility for dynamically loading illustrations with category-based code splitting
import type IconAsset from '@src/types/utils/IconAsset';

// Define category-specific types (single source of truth)
type ProductIllustrationNames =
    | 'BankArrowPink'
    | 'BankMouseGreen'
    | 'BankUserGreen'
    | 'BrokenMagnifyingGlass'
    | 'ConciergeBlue'
    | 'ConciergeExclamation'
    | 'CreditCardsBlue'
    | 'EmptyStateExpenses'
    | 'InvoiceOrange'
    | 'JewelBoxBlue'
    | 'JewelBoxGreen'
    | 'JewelBoxPink'
    | 'JewelBoxYellow'
    | 'PaymentHands'
    | 'MoneyEnvelopeBlue'
    | 'MoneyMousePink'
    | 'MushroomTopHat'
    | 'ReceiptsSearchYellow'
    | 'ReceiptYellow'
    | 'RocketBlue'
    | 'RocketOrange'
    | 'SafeBlue'
    | 'TadaYellow'
    | 'TadaBlue'
    | 'ToddBehindCloud'
    | 'ToddWithPhones'
    | 'GpsTrackOrange'
    | 'HoldExpense'
    | 'ThreeLeggedLaptopWoman'
    | 'Hands'
    | 'SmartScan'
    | 'TeleScope'
    | 'FolderWithPapers'
    | 'EmptyStateTravel'
    | 'Abracadabra'
    | 'MagicCode'
    | 'CardReplacementSuccess'
    | 'ReceiptsStackedOnPin'
    | 'ReceiptFairy'
    | 'RocketDude';

type SimpleIllustrationNames =
    | 'BigRocket'
    | 'ChatBubbles'
    | 'CoffeeMug'
    | 'EmailAddress'
    | 'EnvelopeReceipt'
    | 'FolderOpen'
    | 'HandCard'
    | 'HotDogStand'
    | 'Mailbox'
    | 'ReceiptWrangler'
    | 'SanFrancisco'
    | 'SmallRocket'
    | 'ShieldYellow'
    | 'MoneyReceipts'
    | 'PinkBill'
    | 'CreditCardsNew'
    | 'CreditCardsNewGreen'
    | 'InvoiceBlue'
    | 'LockOpen'
    | 'Luggage'
    | 'MoneyIntoWallet'
    | 'MoneyWings'
    | 'OpenSafe'
    | 'TrackShoe'
    | 'BankArrow'
    | 'ConciergeBubble'
    | 'ConciergeNew'
    | 'MoneyBadge'
    | 'TreasureChest'
    | 'ThumbsUpStars'
    | 'Hourglass'
    | 'CommentBubbles'
    | 'CommentBubblesBlue'
    | 'TrashCan'
    | 'Profile'
    | 'Puzzle'
    | 'PalmTree'
    | 'LockClosed'
    | 'Gears'
    | 'QRCode'
    | 'RealtimeReport'
    | 'ReceiptEnvelope'
    | 'Approval'
    | 'WalletAlt'
    | 'Workflows'
    | 'House'
    | 'Building'
    | 'Buildings'
    | 'Alert'
    | 'TeachersUnite'
    | 'Abacus'
    | 'Binoculars'
    | 'CompanyCard'
    | 'ReceiptUpload'
    | 'SplitBill'
    | 'Pillow'
    | 'Accounting'
    | 'Car'
    | 'Coins'
    | 'Pencil'
    | 'Tag'
    | 'CarIce'
    | 'ReceiptLocationMarker'
    | 'Lightbulb'
    | 'Stopwatch'
    | 'SubscriptionAnnual'
    | 'SubscriptionPPU'
    | 'SendMoney'
    | 'CheckmarkCircle'
    | 'CreditCardEyes'
    | 'LockClosedOrange'
    | 'EmptyState'
    | 'VirtualCard'
    | 'Tire'
    | 'BigVault'
    | 'Filters'
    | 'MagnifyingGlassMoney'
    | 'Rules'
    | 'RunningTurtle'
    | 'HandEarth'
    | 'HeadSet'
    | 'PaperAirplane'
    | 'ReportReceipt'
    | 'PerDiem'
    | 'ReceiptPartners';

type CompanyCardIllustrationNames =
    | 'PendingBank'
    | 'CompanyCardsEmptyState'
    | 'AmexCompanyCards'
    | 'MasterCardCompanyCards'
    | 'VisaCompanyCards'
    | 'CompanyCardsPendingState'
    | 'VisaCompanyCardDetail'
    | 'MasterCardCompanyCardDetail'
    | 'AmexCardCompanyCardDetail'
    | 'TurtleInShell'
    | 'BankOfAmericaCompanyCardDetail'
    | 'BrexCompanyCardDetail'
    | 'CapitalOneCompanyCardDetail'
    | 'ChaseCompanyCardDetail'
    | 'CitibankCompanyCardDetail'
    | 'StripeCompanyCardDetail'
    | 'WellsFargoCompanyCardDetail'
    | 'AmexCardCompanyCardDetailLarge'
    | 'BankOfAmericaCompanyCardDetailLarge'
    | 'BrexCompanyCardDetailLarge'
    | 'CapitalOneCompanyCardDetailLarge'
    | 'ChaseCompanyCardDetailLarge'
    | 'CitibankCompanyCardDetailLarge'
    | 'MasterCardCompanyCardDetailLarge'
    | 'StripeCompanyCardDetailLarge'
    | 'VisaCompanyCardDetailLarge'
    | 'WellsFargoCompanyCardDetailLarge'
    | 'PlaidCompanyCardDetail'
    | 'PlaidCompanyCardDetailLarge';

type OtherAssetNames =
    | 'EmptyCardState'
    | 'LaptopWithSecondScreenAndHourglass'
    | 'ExpensifyCardIllustration'
    | 'ExpensifyApprovedLogo'
    | 'ExpensifyApprovedLogoLight'
    | 'Flash'
    | 'ExpensifyMobileApp'
    | 'EmptyShelves'
    | 'Encryption';

// Combined type for all illustrations (if needed elsewhere)
type AllIllustrationNames = ProductIllustrationNames | SimpleIllustrationNames | CompanyCardIllustrationNames | OtherAssetNames;

// Clean loader functions - no duplication!
const loadProductIllustration = (name: ProductIllustrationNames) => {
    return import(/* webpackChunkName: "product-illustrations" */ './product-illustrations.chunk').then((m) => ({default: m[name] as IconAsset}));
};

const loadSimpleIllustration = (name: SimpleIllustrationNames) => {
    return import(/* webpackChunkName: "simple-illustrations" */ './simple-illustrations.chunk').then((m) => ({default: m[name] as IconAsset}));
};

const loadCompanyCardIllustration = (name: CompanyCardIllustrationNames) => {
    return import(/* webpackChunkName: "company-cards" */ './company-cards.chunk').then((m) => ({default: m[name] as IconAsset}));
};

const loadOtherAsset = (name: OtherAssetNames) => {
    return import(/* webpackChunkName: "other-assets" */ './other-assets.chunk').then((m) => ({default: m[name] as IconAsset}));
};

// Export all functions
export {loadProductIllustration, loadSimpleIllustration, loadCompanyCardIllustration, loadOtherAsset};

// Export the types for use in other files
export type {ProductIllustrationNames, SimpleIllustrationNames, CompanyCardIllustrationNames, OtherAssetNames, AllIllustrationNames};
