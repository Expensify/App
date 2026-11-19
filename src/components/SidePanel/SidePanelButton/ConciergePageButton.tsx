import useConciergeConversationToOpen from '@hooks/useConciergeConversationToOpen';

import {openConciergeConversation} from '@userActions/ConciergeThreads';

import React from 'react';

import type SidePanelButtonProps from './types';

import HelpButton from './HelpButton';

/** The help button with the flat navigation, which opens the Concierge page on its most recent unread conversation, or on a new one */
function ConciergePageButton({style}: SidePanelButtonProps) {
    const findOrCreateConciergeConversation = useConciergeConversationToOpen();

    return (
        <HelpButton
            style={style}
            onPress={() => openConciergeConversation(findOrCreateConciergeConversation())}
        />
    );
}

export default ConciergePageButton;
