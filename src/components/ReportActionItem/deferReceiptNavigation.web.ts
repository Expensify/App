function deferReceiptNavigation(navigate: () => void) {
    // On web, the first requestAnimationFrame runs before the next paint. Waiting
    // for the second frame lets the receipt click feedback paint before starting
    // the heavier receipt modal navigation work.
    requestAnimationFrame(() => {
        requestAnimationFrame(navigate);
    });
}

export default deferReceiptNavigation;
