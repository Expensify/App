import {createContext, useContext} from 'react';

// True for screens on the Concierge page of the wide flat navigation, where every conversation with Concierge is its own thread.
// The Concierge DM there only starts new conversations, so it always shows the welcome screen instead of its history.
const IsInConciergePageContext = createContext(false);

function useIsInConciergePage(): boolean {
    return useContext(IsInConciergePageContext);
}

export default useIsInConciergePage;
export {IsInConciergePageContext};
