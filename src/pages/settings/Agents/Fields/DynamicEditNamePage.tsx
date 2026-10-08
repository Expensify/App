import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateAgentName} from '@libs/actions/Agent';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditAgentNameForm';

import React from 'react';

type DynamicEditNamePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_NAME>;

function DynamicEditNamePage({route}: DynamicEditNamePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const accountID = route.params.accountID;
    const [personalDetails] = usePersonalDetail(accountID);

    const {inputCallbackRef} = useAutoFocusInput();

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_AGENT_NAME_FORM>) => {
        updateAgentName(accountID, values[INPUT_IDS.FIRST_NAME].trim(), personalDetails?.displayName ?? '');
        Navigation.goBack(useDynamicBackPath(DYNAMIC_ROUTES.AGENT_EDIT_NAME.path));
    };

    return (
        <ScreenWrapper
            testID={DynamicEditNamePage.displayName}
            includeSafeAreaPaddingBottom
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('editAgentNamePage.title')}
                onBackButtonPress={() => Navigation.goBack(useDynamicBackPath(DYNAMIC_ROUTES.AGENT_EDIT_NAME.path))}
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
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

DynamicEditNamePage.displayName = 'DynamicEditNamePage';

export default DynamicEditNamePage;
