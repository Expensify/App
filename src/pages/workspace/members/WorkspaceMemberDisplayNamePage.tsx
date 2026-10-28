import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormFields from '@components/Form/Layout/FormFields';
import FormHeader from '@components/Form/Layout/FormHeader';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameErrors} from '@libs/ValidationUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {updatePolicyMemberDisplayName} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/DisplayNameForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useState} from 'react';

type WorkspaceMemberDisplayNamePageProps = PlatformStackScreenProps<ProfileNavigatorParamList, typeof SCREENS.DYNAMIC_PROFILE_DISPLAY_NAME>;

function WorkspaceMemberDisplayNamePage({route}: WorkspaceMemberDisplayNamePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const accountID = Number(route.params.memberAccountID);
    const policyID = route.params.policyID;
    const [memberPersonalDetails, memberPersonalDetailsResult] = usePersonalDetail(accountID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const memberLogin = memberPersonalDetails?.login;
    const isLoadingMemberPersonalDetails = isLoadingOnyxValue(memberPersonalDetailsResult);
    const hasDisplayNameSet = !!memberPersonalDetails?.firstName || !!memberPersonalDetails?.lastName;
    const isPolicyMember = !!memberLogin && !!policy?.employeeList?.[memberLogin];
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.PROFILE_DISPLAY_NAME.path);

    // Saving sets the name straight away, so without this the page would block itself while it closes.
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_MEMBER_DISPLAY_NAME_FORM>) => getDisplayNameErrors(values.firstName, values.lastName, translate);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isLoadingMemberPersonalDetails && !hasSubmitted && (hasDisplayNameSet || !isPolicyMember)}
            fullPageNotFoundViewProps={{onBackButtonPress: () => Navigation.goBack(backPath)}}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
                testID="WorkspaceMemberDisplayNamePage"
            >
                {isLoadingMemberPersonalDetails ? (
                    <FullscreenLoadingIndicator />
                ) : (
                    <>
                        <HeaderWithBackButtonAndTitle
                            title={translate('displayNamePage.headerTitle')}
                            onBackButtonPress={() => Navigation.goBack()}
                        />
                        <FormProvider
                            style={[styles.flexGrow1, styles.ph5]}
                            formID={ONYXKEYS.FORMS.WORKSPACE_MEMBER_DISPLAY_NAME_FORM}
                            validate={validate}
                            onSubmit={(values) => {
                                if (!memberLogin) {
                                    return;
                                }
                                setHasSubmitted(true);
                                updatePolicyMemberDisplayName(policyID, values.firstName.trim(), values.lastName.trim(), formatPhoneNumber, {
                                    accountID,
                                    email: memberLogin,
                                    firstName: memberPersonalDetails?.firstName,
                                    lastName: memberPersonalDetails?.lastName,
                                    displayName: memberPersonalDetails?.displayName,
                                    avatar: memberPersonalDetails?.avatar,
                                });
                                Navigation.goBack();
                            }}
                            submitButtonText={translate('common.save')}
                            enabledWhenOffline
                            shouldValidateOnBlur
                            shouldValidateOnChange
                        >
                            <FormHeader description={translate('displayNamePage.isShownOnMemberProfile')} />
                            <FormFields>
                                <InputWrapper
                                    InputComponent={TextInput}
                                    inputID={INPUT_IDS.FIRST_NAME}
                                    label={translate('common.firstName')}
                                    aria-label={translate('common.firstName')}
                                    role={CONST.ROLE.PRESENTATION}
                                    spellCheck={false}
                                    autoCapitalize="words"
                                    autoComplete={CONST.AUTO_COMPLETE_VARIANTS.OFF}
                                />
                                <InputWrapper
                                    InputComponent={TextInput}
                                    inputID={INPUT_IDS.LAST_NAME}
                                    label={translate('common.lastName')}
                                    aria-label={translate('common.lastName')}
                                    role={CONST.ROLE.PRESENTATION}
                                    spellCheck={false}
                                    autoCapitalize="words"
                                    autoComplete={CONST.AUTO_COMPLETE_VARIANTS.OFF}
                                />
                            </FormFields>
                        </FormProvider>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceMemberDisplayNamePage;
