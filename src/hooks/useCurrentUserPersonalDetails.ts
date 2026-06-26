import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';

import {useContext} from 'react';

function useCurrentUserPersonalDetails() {
    return useContext(CurrentUserPersonalDetailsContext);
}

export default useCurrentUserPersonalDetails;
