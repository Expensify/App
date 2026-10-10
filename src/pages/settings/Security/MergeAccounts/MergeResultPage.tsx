import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useMergeResultConfirmationConfig from '@hooks/useMergeResultConfirmationConfig';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import {useEffect} from 'react';

function MergeResultPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT>>();
    const {result, login, backTo} = params;

    useEffect(() => {
        /**
         * If the result is success, we need to remove the initial screen from the navigation state
         * so that the back button closes the modal instead of going back to the initial screen.
         */
        if (result !== CONST.MERGE_ACCOUNT_RESULTS.SUCCESS) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS);
            },
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [result]);

    const {
        heading,
        headingStyle,
        onButtonPress,
        descriptionStyle,
        illustration,
        illustrationStyle,
        description,
        descriptionComponent,
        buttonText,
        secondaryButtonText,
        onSecondaryButtonPress,
        shouldShowSecondaryButton,
        cta,
        ctaComponent,
        ctaStyle,
    } = useMergeResultConfirmationConfig({result, login});

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="MergeResultPage"
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                shouldShowBackButton={result !== CONST.MERGE_ACCOUNT_RESULTS.SUCCESS}
                onBackButtonPress={() => {
                    Navigation.goBack(backTo ?? ROUTES.SETTINGS_MERGE_ACCOUNTS.getRoute());
                }}
            />
            <ConfirmationPage style={{...styles.flexGrow1, ...styles.mt3}}>
                <ConfirmationPage.Content>
                    <ConfirmationPage.Illustration
                        illustration={illustration}
                        illustrationStyle={illustrationStyle}
                    />
                    <ConfirmationPage.Heading style={headingStyle}>{heading}</ConfirmationPage.Heading>
                    {descriptionComponent}
                    {!!description && <ConfirmationPage.Description style={[descriptionStyle, styles.textSupporting]}>{description}</ConfirmationPage.Description>}
                    {!!cta && <Text style={[styles.textAlignCenter, ctaStyle]}>{cta}</Text>}
                    {ctaComponent}
                </ConfirmationPage.Content>
                <FixedFooter>
                    {!!shouldShowSecondaryButton && (
                        <ConfirmationPage.SecondaryButton
                            text={secondaryButtonText ?? ''}
                            onPress={onSecondaryButtonPress}
                        />
                    )}
                    <ConfirmationPage.PrimaryButton
                        text={buttonText}
                        onPress={onButtonPress}
                    />
                </FixedFooter>
            </ConfirmationPage>
        </ScreenWrapper>
    );
}

export default MergeResultPage;
