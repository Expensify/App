import {useEffect} from 'react';
import {hideEmojiPicker, isActive} from '@userActions/EmojiPickerAction';

function useActionEmojiPickerCleanup(isDeletedParentAction: boolean, actionID: string) {
    useEffect(() => {
        if (!isDeletedParentAction || !isActive(actionID)) {
            return;
        }

        hideEmojiPicker(true);
    }, [isDeletedParentAction, actionID]);
}

export default useActionEmojiPickerCleanup;
