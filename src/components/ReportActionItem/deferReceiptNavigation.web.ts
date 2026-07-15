function deferReceiptNavigation(navigate: () => void) {
    requestAnimationFrame(() => {
        requestAnimationFrame(navigate);
    });
}

export default deferReceiptNavigation;
