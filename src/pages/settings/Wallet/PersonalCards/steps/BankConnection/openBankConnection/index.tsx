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

    bankConnectionWindow = window.open(url, '_blank');
    bankConnectionURL = url;
    return bankConnectionWindow;
};

export default handleOpenBankConnectionFlow;
