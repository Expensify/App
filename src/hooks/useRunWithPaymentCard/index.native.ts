/** Adding a payment card is only available on web, so the action runs right away and any card error comes from the server. */
function useRunWithPaymentCard() {
    return (action: () => void) => action();
}

export default useRunWithPaymentCard;
