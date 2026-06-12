// Styles to meet Apple Wallet branding guidelines
// https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/

const addToWalletButtonStyles = {
    width: 125,
    height: 40,
    // Without scaling button content is too small
    transform: [{scaleX: 1.25}, {scaleY: 1.25}],
};

export default addToWalletButtonStyles;
