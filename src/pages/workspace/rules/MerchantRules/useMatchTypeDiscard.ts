import useBeforeRemove from '@hooks/useBeforeRemove';

import {updateDraftMerchantRule} from '@libs/actions/User';

import {useRef, useState} from 'react';

import type {MatchTypeField, MatchTypeOperator} from './matchTypeOptions';

import {getDefaultMatchType} from './matchTypeOptions';

/**
 * Keeps a comparison on the rule only if the page that owns it is saved.
 *
 * The comparison is picked on a page of its own, so it reaches the rule before the value it compares does.
 * Leaving without saving has to put it back, and a page is left by the header Back button, the Android system
 * Back button, an iOS swipe and the browser's own Back, so the restore hangs off the screen being removed rather
 * than off any one of them. The returned function marks the comparison as kept, which Save calls before it
 * navigates.
 */
function useMatchTypeDiscard(field: MatchTypeField, matchType: MatchTypeOperator | undefined): () => void {
    const [initialMatchType] = useState(matchType ?? getDefaultMatchType(field));
    const isSavedRef = useRef(false);

    useBeforeRemove(() => {
        if (isSavedRef.current) {
            return;
        }
        updateDraftMerchantRule({[field]: initialMatchType});
    });

    return () => {
        isSavedRef.current = true;
    };
}

export default useMatchTypeDiscard;
