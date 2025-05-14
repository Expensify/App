import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useExpensifyCardFeeds(policyID: string | undefined) {
    const [allExpensifyCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: (cardSettings) => {
            const matchingEntries = Object.entries(cardSettings ?? {}).filter(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ([_, settings]) => settings?.preferredPolicy && settings.preferredPolicy === policyID,
            );

            return Object.fromEntries(matchingEntries);
        },
    });

    return allExpensifyCardFeeds;
}

export default useExpensifyCardFeeds;
