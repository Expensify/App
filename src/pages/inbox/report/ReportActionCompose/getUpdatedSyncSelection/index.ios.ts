import type GetUpdatedSyncSelection from './types';

// We only need to update the sync selection on iOS platforms
const getUpdatedSyncSelection: GetUpdatedSyncSelection = ({commentWithSpaceInserted, newComment, position}) => {
    if (commentWithSpaceInserted === newComment) {
        return;
    }

    return {position, value: newComment};
};

export default getUpdatedSyncSelection;
