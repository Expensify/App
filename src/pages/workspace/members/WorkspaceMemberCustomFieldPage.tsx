import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateMemberCustomField} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

type WorkspacePolicyOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};
type WorkspaceMemberCustomFieldPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    WorkspacePolicyOnyxProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD>;

function WorkspaceMemberCustomFieldPage({policy, route, personalDetails}: WorkspaceMemberCustomFieldPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const params = route.params;
    const customFieldType = params.customFieldType;
    const accountID = Number(params.accountID);
    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const customFieldKey = CONST.CUSTOM_FIELD_KEYS[customFieldType];
    const [customField, setCustomField] = useState(member?.[customFieldKey ?? ''] ?? '');
    const customFieldText = translate(`workspace.common.${customFieldType}`);
    const policyID = params.policyID;
    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    }, [accountID, policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
        >
            <ScreenWrapper
                testID="WorkspaceMemberCustomFieldPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={customFieldText}
                    onBackButtonPress={goBack}
                />
                <View style={[styles.ph5, styles.pb5]}>
                    <Text>{translate('workspace.common.customFieldHint')}</Text>
                </View>
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_MEMBER_CUSTOM_FIELD_FORM}
                    style={[styles.flexGrow1, styles.ph5]}
                    enabledWhenOffline
                    submitButtonText={translate('common.save')}
                    onSubmit={() => {
                        updateMemberCustomField(params.policyID, memberLogin, customFieldType, customField.trim());
                        goBack();
                    }}
                >
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        label={customFieldText}
                        accessibilityLabel={customFieldText}
                        role={CONST.ROLE.PRESENTATION}
                        inputID="customField"
                        value={customField}
                        onChangeText={setCustomField}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberCustomFieldPage);
