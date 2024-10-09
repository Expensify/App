import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Policy from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WorkspaceCompanyCardFeedName} from '@src/types/form/WorkspaceCompanyCardFeedName';
import INPUT_IDS from '@src/types/form/WorkspaceTaxCustomName';

type WorkspaceCompanyCardsSettingsFeedNamePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME>;

function WorkspaceCompanyCardsSettingsFeedNamePage({
    route: {
        params: {policyID},
    },
}: WorkspaceCompanyCardsSettingsFeedNamePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID;
    // const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`)
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const lastSelectedFeed = 'cdfbmo';
    const feedName = cardFeeds?.companyCardNicknames?.[lastSelectedFeed] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_COMPANY_CARD_FEED_NAME>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_COMPANY_CARD_FEED_NAME> = {};
            const value = values[INPUT_IDS.NAME];

            if (!ValidationUtils.isRequiredFulfilled(value)) {
                errors.name = translate('workspace.moreFeatures.companyCards.error.feedNameRequired');
            }

            return errors;
        },
        [translate],
    );

    const submit = ({name}: WorkspaceCompanyCardFeedName) => {
        Policy.setWorkspaceCompanyCardFeedName(policyID, workspaceAccountID, lastSelectedFeed, name);
        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
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
                >
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            role={CONST.ROLE.PRESENTATION}
                            inputID={INPUT_IDS.NAME}
                            label={translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            defaultValue={feedName}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
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
