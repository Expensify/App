import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';
import {doesContainReservedWord, isRequiredFulfilled, isValidDisplayName} from '@libs/ValidationUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {updatePolicyMemberDisplayName} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/DisplayNameForm';

import React from 'react';
import {View} from 'react-native';

type WorkspaceMemberDisplayNamePageProps = PlatformStackScreenProps<ProfileNavigatorParamList, typeof SCREENS.DYNAMIC_PROFILE_DISPLAY_NAME>;

function WorkspaceMemberDisplayNamePage({route}: WorkspaceMemberDisplayNamePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const accountID = Number(route.params.memberAccountID);
    const policyID = route.params.policyID;
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const memberPersonalDetails = personalDetails?.[accountID];

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_MEMBER_DISPLAY_NAME_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_MEMBER_DISPLAY_NAME_FORM> = {};

        if (!isValidDisplayName(values.firstName)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
        } else if (values.firstName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            addErrorMessage(errors, 'firstName', translate('common.error.characterLimitExceedCounter', values.firstName.length, CONST.DISPLAY_NAME.MAX_LENGTH));
        } else if (!isRequiredFulfilled(values.firstName)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.requiredFirstName'));
        }
        if (doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.containsReservedWord'));
        }

        if (!isValidDisplayName(values.lastName)) {
            addErrorMessage(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
        } else if (values.lastName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            addErrorMessage(errors, 'lastName', translate('common.error.characterLimitExceedCounter', values.lastName.length, CONST.DISPLAY_NAME.MAX_LENGTH));
        }
        if (doesContainReservedWord(values.lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            addErrorMessage(errors, 'lastName', translate('personalDetails.error.containsReservedWord'));
        }
        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
                testID="WorkspaceMemberDisplayNamePage"
            >
                <HeaderWithBackButton
                    title={translate('displayNamePage.headerTitle')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_MEMBER_DISPLAY_NAME_FORM}
                    validate={validate}
                    onSubmit={(values) => {
                        updatePolicyMemberDisplayName(policyID, values.firstName.trim(), values.lastName.trim(), formatPhoneNumber, {
                            accountID,
                            email: memberPersonalDetails?.login,
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
                    <Text style={[styles.mb6]}>{translate('displayNamePage.isShownOnMemberProfile')}</Text>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.FIRST_NAME}
                            name="fname"
                            label={translate('common.firstName')}
                            aria-label={translate('common.firstName')}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                            autoCapitalize="words"
                            autoComplete="given-name"
                        />
                    </View>
                    <View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.LAST_NAME}
                            name="lname"
                            label={translate('common.lastName')}
                            aria-label={translate('common.lastName')}
                            role={CONST.ROLE.PRESENTATION}
                            spellCheck={false}
                            autoCapitalize="words"
                            autoComplete="family-name"
                        />
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceMemberDisplayNamePage;
