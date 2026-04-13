import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {setPageTitle, setShouldShowBranchNameInTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useDocumentTitle(title: string) {
    const [shouldShowBranchNameInTitle] = useOnyx(ONYXKEYS.SHOULD_SHOW_BRANCH_NAME_IN_TITLE);

    useEffect(() => {
        setShouldShowBranchNameInTitle(shouldShowBranchNameInTitle ?? false);
    }, [shouldShowBranchNameInTitle]);

    useFocusEffect(
        useCallback(() => {
            setPageTitle(title);
        }, [title]),
    );
}

export default useDocumentTitle;
