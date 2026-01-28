import React from 'react';
import {View} from 'react-native';
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
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddMatchTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE>;

type MatchTypeItem = ListItem & {
    value: string;
};

function AddMatchTypePage({route}: AddMatchTypePageProps) {
    const {policyID, ruleID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isEditing = ruleID !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});

    const selectedValue = form?.matchType ?? CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS;

    const goBack = () => {
        Navigation.goBack(ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, isEditing ? ruleID : undefined));
    };

    const items: MatchTypeItem[] = [
        {
            value: CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS,
            keyForList: CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS,
            text: translate('workspace.rules.merchantRules.matchTypeContains'),
            isSelected: selectedValue === CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS,
        },
        {
            value: CONST.MERCHANT_RULES.MATCH_TYPE.EXACT,
            keyForList: CONST.MERCHANT_RULES.MATCH_TYPE.EXACT,
            text: translate('workspace.rules.merchantRules.matchTypeExact'),
            isSelected: selectedValue === CONST.MERCHANT_RULES.MATCH_TYPE.EXACT,
        },
    ];

    const onSelectItem = (item: MatchTypeItem) => {
        updateDraftMerchantRule({matchType: item.value});
        goBack();
    };

    return (
        <ScreenWrapper
            testID="AddMatchTypePage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.rules.merchantRules.matchType')}
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

AddMatchTypePage.displayName = 'AddMatchTypePage';

export default AddMatchTypePage;
