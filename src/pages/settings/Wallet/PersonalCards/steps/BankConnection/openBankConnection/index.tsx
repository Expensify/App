let bankConnectionWindow: Window | null = null;

const handleOpenBankConnectionFlow = (url: string) => {
    if (bankConnectionWindow && !bankConnectionWindow.closed) {
        bankConnectionWindow.focus();
        return bankConnectionWindow;
    }

    bankConnectionWindow = window.open(url, '_blank');
    return bankConnectionWindow;
};

export default handleOpenBankConnectionFlow;
