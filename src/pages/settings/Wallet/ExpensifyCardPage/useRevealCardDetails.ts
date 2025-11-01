import {useCallback} from 'react';
import {revealVirtualCardDetails} from '@libs/actions/Card';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import useExpensifyCardContext from './useExpensifyCardContext';

function useRevealCardDetails(cardID: string) {
    const {setIsCardDetailsLoading, setCardsDetails, setCardsDetailsErrors} = useExpensifyCardContext();

    const handleRevealCardDetails = useCallback(
        (validateCode: string) => {
            setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({
                ...prevState,
                [cardID]: true,
            }));

            // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
            revealVirtualCardDetails(Number.parseInt(cardID, 10), validateCode)
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

                    // Dismiss the page for missing private details error
                    if (error === 'cardPage.missingPrivateDetails') {
                        Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
                    }
                })
                .finally(() => {
                    setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({...prevState, [cardID]: false}));
                });
        },
        [cardID, setCardsDetails, setCardsDetailsErrors, setIsCardDetailsLoading],
    );

    return handleRevealCardDetails;
}

export default useRevealCardDetails;

