import DynamicFormFields from '@components/DynamicForm/DynamicFormFields';
import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import groupFieldsIntoPages from '@components/DynamicForm/groupFieldsIntoPages';
import FormProvider from '@components/Form/FormProvider';
import type {FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {submitWiseKYCRequirement} from '@userActions/BankAccounts/wise';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';
import {View} from 'react-native';

import getWiseRequirementTitle from './getWiseRequirementTitle';

type RequirementFormPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENT_FORM>;

function RequirementFormPage({route}: RequirementFormPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const bankAccountID = Number(route.params.bankAccountID);
    const {requirementKey} = route.params;
    const [requirement] = useOnyx(ONYXKEYS.WISE_KYC_REQUIREMENTS, {selector: (requirements) => requirements?.find((item) => item.key === requirementKey)});
    const [, draftMetadata] = useOnyx(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM_DRAFT);
    const fields = requirement?.fields ?? [];
    const pages = groupFieldsIntoPages(fields);

    const goBackToList = () => Navigation.goBack(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(bankAccountID));

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM>) => getDynamicFieldErrors(fields, values, translate);

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM>) => {
        submitWiseKYCRequirement(bankAccountID, requirementKey, values);
        goBackToList();
    };

    return (
        <ScreenWrapper
            testID="WiseKYCRequirementFormPage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={getWiseRequirementTitle(requirementKey, translate)}
                onBackButtonPress={goBackToList}
            />
            {isLoadingOnyxValue(draftMetadata) ? (
                <FullScreenLoadingIndicator />
            ) : (
                <FormProvider
                    formID={ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM}
                    submitButtonText={translate('common.submit')}
                    onSubmit={submit}
                    validate={validate}
                    style={[styles.flexGrow1, styles.mt3]}
                    submitButtonStyles={[styles.ph5, styles.mb0]}
                    enabledWhenOffline
                >
                    {({inputValues}) =>
                        pages.map((page) => (
                            <View
                                key={page.name}
                                style={styles.ph5}
                            >
                                {pages.length > 1 && <Text style={[styles.textHeadlineH2, styles.mb2]}>{page.name}</Text>}
                                <DynamicFormFields
                                    fields={page.fields}
                                    values={inputValues}
                                />
                            </View>
                        ))
                    }
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

export default RequirementFormPage;
