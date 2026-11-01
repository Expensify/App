import {createContext, useContext} from 'react';

type AskConciergeActions = {
    /** Shows the thread Concierge just opened, so sending a message keeps the user on the page. */
    openConciergeThread?: (reportID: string) => void;
};

const AskConciergeContext = createContext(false);
const AskConciergeActionsContext = createContext<AskConciergeActions>({});

/** True while a report or composer renders inside the Ask Concierge page, which has its own chrome. */
function useIsInAskConcierge(): boolean {
    return useContext(AskConciergeContext);
}

function useAskConciergeActions(): AskConciergeActions {
    return useContext(AskConciergeActionsContext);
}

export default useIsInAskConcierge;
export {AskConciergeContext, AskConciergeActionsContext, useAskConciergeActions};
