import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isValidDate} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';
import {View} from 'react-native';

import {getMatchTypeLabel} from './matchTypeOptions';
import useMatchTypeDiscard from './useMatchTypeDiscard';
import useRuleConditionDraft from './useRuleConditionDraft';
import withFlagRuleConditionAccess from './withFlagRuleConditionAccess';

type AddDateToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_DATE_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_DATE_TO_MATCH>;
type RuleDateFormID = typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM | typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM;

function AddDateToMatchPage({route}: AddDateToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const flagCondition = 'flagCondition' in route.params ? route.params.flagCondition : undefined;
    const {isEditing, backToRoute, getRuleRoute, form, updateDraft, formID} = useRuleConditionDraft(DYNAMIC_ROUTES.RULES_DATE_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID, flagCondition);
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const currentValue = form?.dateToMatch ?? '';

    const keepMatchType = useMatchTypeDiscard('dateMatchType', form?.dateMatchType, updateDraft);

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const saveDate = (values: FormOnyxValues<RuleDateFormID>) => {
        keepMatchType();
        updateDraft({dateToMatch: values.dateToMatch ?? ''});
        goBack();
    };

    const validate = (values: FormOnyxValues<RuleDateFormID>) => {
        const errors: FormInputErrors<RuleDateFormID> = {};
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
            <FormProvider<RuleDateFormID>
                style={[styles.flex1]}
                formID={formID}
                validate={validate}
                onSubmit={saveDate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                submitButtonStyles={[styles.ph5]}
            >
                <View style={[styles.mb5, styles.ph5]}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={MERCHANT_RULE_INPUT_IDS.DATE_TO_MATCH}
                        label={translate('common.date')}
                        defaultValue={currentValue}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    />
                </View>
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_DATE_MATCH_TYPE}
                    name={translate('workspace.rules.merchantRules.matchType')}
                    onPress={() =>
                        Navigation.navigate(
                            getRuleRoute(
                                DYNAMIC_ROUTES.RULES_DATE_MATCH_TYPE_FROM_EXPENSE.path,
                                ROUTES.RULES_DATE_MATCH_TYPE.getRoute(policyID, isEditing ? ruleID : undefined, flagCondition),
                            ),
                        )
                    }
                    value={getMatchTypeLabel('dateMatchType', form?.dateMatchType, translate)}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

export default withFlagRuleConditionAccess(AddDateToMatchPage);
