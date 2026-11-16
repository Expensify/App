import {useState} from 'react';

import type {MatchTypeField, MatchTypeOperator} from './matchTypeOptions';

import {getDefaultMatchType} from './matchTypeOptions';

/**
 * The comparison a condition carried when its page opened, which backing out of that page restores.
 *
 * The comparison is picked on a page of its own, so the only way back to the page that owns it is through the
 * rule being edited. That page commits the value it compares when Save is pressed, so the comparison waits for
 * the same press rather than outliving a press of Back.
 */
function useInitialMatchType(field: MatchTypeField, matchType: MatchTypeOperator | undefined): MatchTypeOperator {
    const [initialMatchType] = useState(matchType ?? getDefaultMatchType(field));

    return initialMatchType;
}

export default useInitialMatchType;
