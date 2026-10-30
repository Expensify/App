import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isValidDate} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddDateToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_DATE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_DATE_TO_MATCH>;

function AddDateToMatchPage({route}: AddDateToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {isEditing, backToRoute, getRuleRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_DATE_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const currentValue = form?.dateToMatch ?? '';
    const dateMatchType = form?.dateMatchType ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;

    const getDateMatchTypeLabel = () => {
        if (dateMatchType === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN) {
            return translate('workspace.rules.merchantRules.dateMatchTypeAfter');
        }
        if (dateMatchType === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN) {
            return translate('workspace.rules.merchantRules.dateMatchTypeBefore');
        }
        return translate('workspace.rules.merchantRules.dateMatchTypeOn');
    };

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        updateDraftMerchantRule(values);
        goBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM> = {};
        const fieldID = MERCHANT_RULE_INPUT_IDS.DATE_TO_MATCH;
        const fieldValue = values[fieldID];

        if (typeof fieldValue === 'string' && fieldValue && !isValidDate(fieldValue)) {
            errors[fieldID] = translate('common.error.dateInvalid');
        }

        return errors;
    };

    return (
        <ScreenWrapper
            testID="AddDateToMatchPage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('common.date')}
                onBackButtonPress={goBack}
            />
            <FormProvider
                style={[styles.flex1]}
                formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
                validate={validate}
                onSubmit={onSave}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                submitButtonStyles={[styles.ph5]}
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={MERCHANT_RULE_INPUT_IDS.DATE_TO_MATCH}
                        label={translate('common.date')}
                        defaultValue={currentValue}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                        containerStyles={[styles.ph5]}
                    />
                </View>
                <MenuItemField
                    name={translate('workspace.rules.merchantRules.matchType')}
                    onPress={() =>
                        Navigation.navigate(
                            getRuleRoute(DYNAMIC_ROUTES.RULES_DATE_MATCH_TYPE_FROM_EXPENSE.path, ROUTES.RULES_DATE_MATCH_TYPE.getRoute(policyID, isEditing ? ruleID : undefined)),
                        )
                    }
                    value={getDateMatchTypeLabel()}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

export default AddDateToMatchPage;
