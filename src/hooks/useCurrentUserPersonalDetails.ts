import {useContext} from 'react';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';

function useCurrentUserPersonalDetails() {
    return useContext(CurrentUserPersonalDetailsContext);
}

export default useCurrentUserPersonalDetails;
