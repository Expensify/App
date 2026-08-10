import useOnyx from '@hooks/useOnyx';

// rulesdir/no-inline-useOnyx-selector: the selector is an inline arrow
function useAccountID() {
    const [accountID] = useOnyx('session', {selector: (session: {accountID: number}) => session.accountID});
    return accountID;
}

export default useAccountID;
