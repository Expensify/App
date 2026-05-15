import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAgentName} from '@libs/actions/Agent';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAgentNameForm';

type EditNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT_NAME>;

function EditNamePage({route}: EditNamePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const accountID = route.params.accountID;
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (list) => list?.[accountID]});

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_NAME_FORM>) => {
        updateAgentName(accountID, values[INPUT_IDS.FIRST_NAME].trim(), personalDetails?.displayName ?? '');
        Navigation.goBack(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(accountID));
    };

    return (
        <ScreenWrapper
            testID={EditNamePage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('editAgentNamePage.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(accountID))}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.EDIT_AGENT_NAME_FORM}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.save')}
                style={[styles.flex1, styles.ph5]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.FIRST_NAME}
                    label={translate('editAgentPage.agentName')}
                    accessibilityLabel={translate('editAgentPage.agentName')}
                    role={CONST.ROLE.PRESENTATION}
                    autoCapitalize="words"
                    spellCheck={false}
                    defaultValue={personalDetails?.displayName ?? ''}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

EditNamePage.displayName = 'EditNamePage';

export default EditNamePage;
