const handleOpenBankConnectionFlow = (url: string) => {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const left = (screenWidth - 700) / 2;
    const top = (screenHeight - 600) / 2;
    const popupFeatures = `width=${700},height=${600},left=${left},top=${top},scrollbars=yes,resizable=yes`;

    return window.open(url, 'popupWindow', popupFeatures);
};

export default handleOpenBankConnectionFlow;
