const WINDOW_WIDTH = 700;
const WINDOW_HEIGHT = 600;
let bankConnectionWindow: Window | null = null;

const handleOpenBankConnectionFlow = (url: string) => {
    if (bankConnectionWindow && !bankConnectionWindow.closed) {
        bankConnectionWindow.focus();
        return bankConnectionWindow;
    }

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const left = (screenWidth - WINDOW_WIDTH) / 2;
    const top = (screenHeight - WINDOW_HEIGHT) / 2;
    const popupFeatures = `width=${WINDOW_WIDTH},height=${WINDOW_HEIGHT},left=${left},top=${top},scrollbars=yes,resizable=yes`;

    bankConnectionWindow = window.open(url, 'popupWindow', popupFeatures);
    return bankConnectionWindow;
};

export default handleOpenBankConnectionFlow;
