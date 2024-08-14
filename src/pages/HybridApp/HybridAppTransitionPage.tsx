import type {StackScreenProps} from '@react-navigation/stack';
import {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {signInOnHybridApp} from '@libs/actions/Session';
import type {HybridAppPublicScreensParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';

type HybridAppTransitionPageProps = StackScreenProps<HybridAppPublicScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function HybridAppTransitionPage({route}: HybridAppTransitionPageProps) {
    const {shortLivedAuthToken, email, accountID} = route?.params ?? {};

    useEffect(() => {
        if (!shortLivedAuthToken || !email || !accountID) {
            return;
        }

        signInOnHybridApp(shortLivedAuthToken, email, accountID);
    }, [accountID, email, shortLivedAuthToken]);

    return <FullScreenLoadingIndicator />;
}

HybridAppTransitionPage.displayName = 'HybridAppTransitionPage';

export default HybridAppTransitionPage;
