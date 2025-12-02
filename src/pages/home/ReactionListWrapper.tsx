import React, {useRef} from 'react';
import PopoverReactionList from './report/ReactionList/PopoverReactionList';
import {ReactionListContext} from './ReportScreenContext';
import type {ReactionListRef} from './ReportScreenContext';

function ReactionListWrapper({children}: {children: React.ReactNode}) {
    const reactionListRef = useRef<ReactionListRef>(null);
    return (
        <ReactionListContext.Provider value={reactionListRef}>
            {children}
            <PopoverReactionList ref={reactionListRef} />
        </ReactionListContext.Provider>
    );
}

export default ReactionListWrapper;
