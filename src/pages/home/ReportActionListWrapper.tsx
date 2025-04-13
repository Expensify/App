import React, {useRef} from 'react';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import PopoverReactionList from '@pages/home/report/ReactionList/PopoverReactionList';

export const ReportActionListWrapper = ({children}: {children: React.ReactNode}) => {
    const reactionListRef = useRef<ReactionListRef>(null);
    return (
        <ReactionListContext.Provider value={reactionListRef}>
            {children}
            <PopoverReactionList ref={reactionListRef} />
        </ReactionListContext.Provider>

    )
}