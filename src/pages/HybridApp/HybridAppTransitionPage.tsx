import type {StackScreenProps} from '@react-navigation/stack';
import {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {signInOnHybridApp} from '@libs/actions/Session';
import type {HybridAppPublicScreensParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type HybridAppTransitionPageProps = StackScreenProps<HybridAppPublicScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function HybridAppTransitionPage({route}: HybridAppTransitionPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const {shortLivedAuthToken, email, accountID, exitTo} = route?.params ?? {};

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
