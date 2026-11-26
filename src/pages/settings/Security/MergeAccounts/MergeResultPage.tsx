import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMergeResultConfirmationConfig from '@hooks/useMergeResultConfirmationConfig';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import {pendingMergeRequestByRequesterSelector} from '@selectors/Domain';
import {accountIDSelector} from '@selectors/Session';
import {useEffect} from 'react';

function MergeResultPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['LockClosedOrange']);
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT>>();
    const {result, login, backTo} = params;

    const isTerminalResult = result === CONST.MERGE_ACCOUNT_RESULTS.SUCCESS || result === CONST.MERGE_ACCOUNT_RESULTS.PENDING_DOMAIN_APPROVAL;

    const [currentUserAccountID = CONST.DEFAULT_NUMBER_ID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [myPendingMergeRequest] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ACCOUNT_MERGE_REQUEST, {
        selector: pendingMergeRequestByRequesterSelector(currentUserAccountID),
    });

    useEffect(() => {
        if (result !== CONST.MERGE_ACCOUNT_RESULTS.PENDING_DOMAIN_APPROVAL || myPendingMergeRequest) {
            return;
        }
        Navigation.goBack(ROUTES.SETTINGS_SECURITY.getRoute());
    }, [result, myPendingMergeRequest]);

    useEffect(() => {
        /**
         * For terminal results (success, pending), remove the initial screen from the navigation state so the back button
         * closes the modal instead of returning to the already-submitted details form.
         */
        if (!isTerminalResult) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS);
            },
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [isTerminalResult]);

    const {
        heading,
        onButtonPress,
        primaryButtonText,
        illustration,
        illustrationStyle,
        descriptionComponent,
        secondaryButtonText,
        onSecondaryButtonPress,
        shouldShowSecondaryButton,
        ctaComponent,
    } = useMergeResultConfirmationConfig({result, login});

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="MergeResultPage"
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                shouldShowBackButton={!isTerminalResult}
                onBackButtonPress={() => {
                    Navigation.goBack(backTo ?? ROUTES.SETTINGS_MERGE_ACCOUNTS.getRoute());
                }}
            />
            <ConfirmationPage style={styles.mt3}>
                <ConfirmationPage.Content>
                    <ConfirmationPage.Illustration
                        illustration={illustration ?? lazyIllustrations.LockClosedOrange}
                        illustrationStyle={illustrationStyle}
                    />
                    <ConfirmationPage.Heading>{heading ?? translate('mergeAccountsPage.mergeFailureGenericHeading')}</ConfirmationPage.Heading>
                    {descriptionComponent}
                    {ctaComponent}
                </ConfirmationPage.Content>
                <FixedFooter>
                    {!!shouldShowSecondaryButton && (
                        <ConfirmationPage.SecondaryButton
                            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SECURITY.MERGE_RESULT_GO_TO_CLASSIC}
                            text={secondaryButtonText ?? ''}
                            onPress={onSecondaryButtonPress}
                        />
                    )}
                    <ConfirmationPage.PrimaryButton
                        sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SECURITY.MERGE_RESULT_CONFIRM}
                        text={primaryButtonText ?? translate('common.buttonConfirm')}
                        onPress={onButtonPress ?? (() => Navigation.goBack(ROUTES.SETTINGS_SECURITY.getRoute()))}
                    />
                </FixedFooter>
            </ConfirmationPage>
        </ScreenWrapper>
    );
}

export default MergeResultPage;
