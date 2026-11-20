/**
 * Whether a card is in the device wallet (Apple Wallet or Google Wallet), keyed by cardID.
 *
 * Frontend-owned and RAM-only. The wallet belongs to the device, so it is read again on every app start.
 */
type CardWalletStatus = {
    /** Whether the card counts as added on this device, see `isCardInWallet` for the rules per platform */
    isInWallet: boolean;
};

export default CardWalletStatus;
