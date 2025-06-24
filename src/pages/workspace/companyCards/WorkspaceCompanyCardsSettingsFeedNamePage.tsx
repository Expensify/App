import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCardFeeds from '@hooks/useCardFeeds';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCompanyFeeds, getCustomOrFormattedFeedName, getDomainOrWorkspaceAccountID, getSelectedFeed} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setWorkspaceCompanyCardFeedName} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WorkspaceCompanyCardFeedName} from '@src/types/form/WorkspaceCompanyCardFeedName';
import INPUT_IDS from '@src/types/form/WorkspaceTaxCustomName';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceCompanyCardsSettingsFeedNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME>;

function WorkspaceCompanyCardsSettingsFeedNamePage({
    route: {
        params: {policyID},
    },
}: WorkspaceCompanyCardsSettingsFeedNamePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [lastSelectedFeed, lastSelectedFeedResult] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const [cardFeeds, cardFeedsResult] = useCardFeeds(policyID);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const feedName = getCustomOrFormattedFeedName(selectedFeed, cardFeeds?.settings?.companyCardNicknames);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed ? companyFeeds[selectedFeed] : undefined);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_COMPANY_CARD_FEED_NAME>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_COMPANY_CARD_FEED_NAME> = {};
            const value = values[INPUT_IDS.NAME];

            if (!isRequiredFulfilled(value)) {
                errors.name = translate('workspace.moreFeatures.companyCards.error.feedNameRequired');
            } else if (value.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
                errors.name = translate('common.error.characterLimitExceedCounter', {
                    length: value.length,
                    limit: CONST.DISPLAY_NAME.MAX_LENGTH,
                });
            }

            return errors;
        },
        [translate],
    );

    const submit = ({name}: WorkspaceCompanyCardFeedName) => {
        if (selectedFeed) {
            setWorkspaceCompanyCardFeedName(policyID, domainOrWorkspaceAccountID, selectedFeed, name);
        }
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID));
    };

    if (isLoadingOnyxValue(cardFeedsResult) || isLoadingOnyxValue(lastSelectedFeedResult)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={WorkspaceCompanyCardsSettingsFeedNamePage.displayName}
                style={styles.defaultModalContainer}
            >
                <HeaderWithBackButton title={translate('workspace.moreFeatures.companyCards.cardFeedName')} />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.moreFeatures.companyCards.setFeedNameDescription')}</Text>
                </Text>
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_COMPANY_CARD_FEED_NAME}
                    submitButtonText={translate('workspace.editor.save')}
                    style={[styles.flexGrow1, styles.ph5]}
                    scrollContextEnabled
                    enabledWhenOffline
                    validate={validate}
                    onSubmit={submit}
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.NAME}
                            label={translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            defaultValue={feedName}
                            multiline={false}
                            ref={inputCallbackRef}
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardsSettingsFeedNamePage.displayName = 'WorkspaceCompanyCardsSettingsFeedNamePage';

export default WorkspaceCompanyCardsSettingsFeedNamePage;
