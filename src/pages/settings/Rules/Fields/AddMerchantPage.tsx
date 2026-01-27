import React, {useMemo} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import RuleNotFoundPageWrapper from '@components/Rule/RuleNotFoundPageWrapper';
import RuleTextBase from '@components/Rule/RuleTextBase';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddMerchantPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT_MERCHANT>;

function AddMerchantPage({route}: AddMerchantPageProps) {
    const hash = route.params?.hash;

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSave = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>) => {
        updateDraftRule(values);
        goBack();
    };

    const ContentWrapper = useMemo(() => {
        return function Wrapper({children}: {children: React.ReactNode}) {
            return <RuleNotFoundPageWrapper hash={hash}>{children}</RuleNotFoundPageWrapper>;
        };
    }, [hash]);

    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.MERCHANT}
            formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
            hintKey="expenseRulesPage.addRule.merchantHint"
            isRequired
            titleKey="common.merchant"
            testID="AddMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
            onSave={onSave}
            onBack={goBack}
            ContentWrapper={ContentWrapper}
        />
    );
}

export default AddMerchantPage;
