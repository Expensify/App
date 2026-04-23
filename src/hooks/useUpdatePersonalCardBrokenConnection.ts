import {useCallback} from 'react';
import {getFeedConnectionBrokenCard} from '@libs/CardUtils';
import {updatePersonalCardConnection} from '@userActions/PersonalCards';
import useCardFeedErrors from './useCardFeedErrors';

export default function useUpdatePersonalCardBrokenConnection() {
    const {personalCardsWithBrokenConnection} = useCardFeedErrors();
    const brokenCard = getFeedConnectionBrokenCard(personalCardsWithBrokenConnection);
    const brokenCardId = brokenCard?.cardID?.toString();

    const updateBrokenConnection = useCallback(() => {
        if (!brokenCardId) {
            return;
        }
        updatePersonalCardConnection(brokenCardId, brokenCard?.lastScrapeResult);
    }, [brokenCard?.lastScrapeResult, brokenCardId]);

    return {updateBrokenConnection, isCardBroken: !!brokenCardId};
}
