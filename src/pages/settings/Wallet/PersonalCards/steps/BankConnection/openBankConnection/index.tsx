let bankConnectionWindow: Window | null = null;

const handleOpenBankConnectionFlow = (url: string) => {
    // SelectBankStep opens the popup from the user action before BankConnection requests it again, so reuse it to avoid restarting the connection.
    if (bankConnectionWindow && !bankConnectionWindow.closed) {
        bankConnectionWindow.focus();
        return bankConnectionWindow;
    }

    bankConnectionWindow = window.open(url, '_blank');
    return bankConnectionWindow;
};

export default handleOpenBankConnectionFlow;
