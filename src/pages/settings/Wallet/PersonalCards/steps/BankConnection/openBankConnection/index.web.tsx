const WINDOW_WIDTH = 700;
const WINDOW_HEIGHT = 600;
let bankConnectionWindow: Window | null = null;
let bankConnectionURL: string | null = null;

const handleOpenBankConnectionFlow = (url: string, shouldRestartConnection = false) => {
    // SelectBankStep opens the popup from the user action before BankConnection requests it again, so reuse it to avoid restarting the connection.
    if (bankConnectionWindow && !bankConnectionWindow.closed) {
        if (shouldRestartConnection || bankConnectionURL !== url) {
            bankConnectionWindow.location.href = url;
            bankConnectionURL = url;
        }
        bankConnectionWindow.focus();
        return bankConnectionWindow;
    }

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const left = (screenWidth - WINDOW_WIDTH) / 2;
    const top = (screenHeight - WINDOW_HEIGHT) / 2;
    const popupFeatures = `width=${WINDOW_WIDTH},height=${WINDOW_HEIGHT},left=${left},top=${top},scrollbars=yes,resizable=yes`;

    bankConnectionWindow = window.open(url, 'popupWindow', popupFeatures);
    bankConnectionURL = url;
    return bankConnectionWindow;
};

export default handleOpenBankConnectionFlow;
