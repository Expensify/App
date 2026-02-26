import type {MutableRefObject} from 'react';
import {useEffect} from 'react';
import type {TextInput} from 'react-native';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';

function useActionDraftFocus(draftMessage: string | undefined, prevDraftMessage: string | undefined, composerRef: MutableRefObject<TextInput | HTMLTextAreaElement | null>) {
    useEffect(() => {
        if (prevDraftMessage !== undefined || draftMessage === undefined) {
            return;
        }

        focusComposerWithDelay(composerRef.current)(true);
    }, [prevDraftMessage, draftMessage, composerRef]);
}

export default useActionDraftFocus;
