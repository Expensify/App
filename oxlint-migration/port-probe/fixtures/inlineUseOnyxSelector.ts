import useOnyx from '@hooks/useOnyx';

// rulesdir/no-inline-useOnyx-selector: the selector is an inline arrow
function useAccountID() {
    // 'use no memo': same reason as jsxNoConstructedContextValues.tsx -- this rule is gated on the
    // React Compiler too, and both compilers memoize this hook.
    'use no memo';
    const [accountID] = useOnyx('session', {selector: (session: {accountID: number}) => session.accountID});
    return accountID;
}

export default useAccountID;
