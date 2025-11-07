import React, {useCallback} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setPersonalDetailsAndRevealExpensifyCard} from '@libs/actions/PersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import MissingPersonalDetailsContent from '@pages/MissingPersonalDetails/MissingPersonalDetailsContent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsForm} from '@src/types/form';
import useExpensifyCardContext from './useExpensifyCardContext';

type ExpensifyCardMissingDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS>;

function ExpensifyCardMissingDetailsPage({
    route: {
        params: {cardID = ''},
    },
}: ExpensifyCardMissingDetailsPageProps) {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const {setIsCardDetailsLoading, setCardsDetails, setCardsDetailsErrors} = useExpensifyCardContext();

    const handleComplete = useCallback(
        (values: PersonalDetailsForm, validateCode: string) => {
            setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({
                ...prevState,
                [cardID]: true,
            }));

            setPersonalDetailsAndRevealExpensifyCard(values, validateCode, countryCode, Number.parseInt(cardID, 10))
                .then((value) => {
                    setCardsDetails((prevState) => ({...prevState, [cardID]: value}));
                    setCardsDetailsErrors((prevState) => ({
                        ...prevState,
                        [cardID]: '',
                    }));
                    Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
                })
                .catch((error: string) => {
                    setCardsDetailsErrors((prevState) => ({
                        ...prevState,
                        [cardID]: error,
                    }));
                    Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
                })
                .finally(() => {
                    setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({...prevState, [cardID]: false}));
                });
        },
        [cardID, countryCode, setCardsDetails, setCardsDetailsErrors, setIsCardDetailsLoading],
    );

    return (
        <MissingPersonalDetailsContent
            privatePersonalDetails={privatePersonalDetails}
            draftValues={draftValues}
            headerTitle={translate('cardPage.cardDetails.revealDetails')}
            onComplete={handleComplete}
        />
    );
}

ExpensifyCardMissingDetailsPage.displayName = 'ExpensifyCardMissingDetailsPage';

export default ExpensifyCardMissingDetailsPage;
