import React, {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import MissingPersonalDetailsContent from '@pages/MissingPersonalDetails/MissingPersonalDetailsContent';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExpensifyCardMissingDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS>;

function ExpensifyCardMissingDetailsPage({
    route: {
        params: {cardID = ''},
    },
}: ExpensifyCardMissingDetailsPageProps) {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {canBeMissing: true});

    const handleComplete = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_MISSING_DETAILS_CONFIRM_MAGIC_CODE.getRoute(cardID));
    }, [cardID]);

    return (
        <MissingPersonalDetailsContent
            privatePersonalDetails={privatePersonalDetails}
            draftValues={draftValues}
            headerTitle={translate('cardPage.cardDetails.revealDetails')}
            onComplete={handleComplete}
        />
    );
}

export default ExpensifyCardMissingDetailsPage;
