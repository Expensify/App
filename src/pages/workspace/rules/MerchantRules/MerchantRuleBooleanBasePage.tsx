import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {InputID} from '@src/types/form/MerchantRuleForm';

type BooleanFilterItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.BOOLEAN>;
};

type MerchantRuleBooleanBasePageProps = {
    /** The key from boolean-based InputID */
    fieldID: InputID;

    /** The translation key for the page title */
    titleKey: TranslationPaths;

    /** The policy ID */
    policyID: string;
};

const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);

function MerchantRuleBooleanBasePage({fieldID, titleKey, policyID}: MerchantRuleBooleanBasePageProps) {
    const {translate} = useLocalize();
    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const styles = useThemeStyles();

    const selectedItem =
        booleanValues.find((value) => {
            if (!form?.[fieldID]) {
                return false;
            }
            const booleanValue = form[fieldID] === 'true' ? CONST.SEARCH.BOOLEAN.YES : CONST.SEARCH.BOOLEAN.NO;
            return booleanValue === value;
        }) ?? null;

    const items = booleanValues.map((value) => ({
        value,
        keyForList: value,
        text: translate(`common.${value}`),
        isSelected: selectedItem === value,
    }));

    const goBack = () => {
        Navigation.goBack(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    const onSelectItem = (selectedValue: BooleanFilterItem) => {
        const newValue = selectedValue.isSelected ? null : selectedValue.value;
        let value = '';
        if (newValue === CONST.SEARCH.BOOLEAN.YES) {
            value = 'true';
        } else if (newValue === CONST.SEARCH.BOOLEAN.NO) {
            value = 'false';
        }
        updateDraftMerchantRule({[fieldID]: value});
        goBack();
    };

    return (
        <ScreenWrapper
            testID="MerchantRuleBooleanBasePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={goBack}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={items}
                    ListItem={SingleSelectListItem}
                    onSelectRow={onSelectItem}
                />
            </View>
        </ScreenWrapper>
    );
}

export default MerchantRuleBooleanBasePage;
