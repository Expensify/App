import type {Dispatch} from 'react';
import {useCallback} from 'react';
import * as Report from '@userActions/Report';

/**
 * Hook for fetching reports when user updated search term and hasn't selected max number of participants
 */
const useSearchTermAndSearch = (setSearchTerm: Dispatch<React.SetStateAction<string>>, maxParticipantsReached: boolean) => {
    const setSearchTermAndSearchInServer = useCallback(
        (text = '') => {
            if (text && !maxParticipantsReached) {
                Report.searchInServer(text);
            }
            setSearchTerm(text);
        },
        [maxParticipantsReached, setSearchTerm],
    );

    return setSearchTermAndSearchInServer;
};

export default useSearchTermAndSearch;
