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

type MerchantMatchTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE>;

type MatchTypeItem = ListItem & {
    value: string;
};

const MATCH_TYPES = CONST.MERCHANT_RULES.MATCH_TYPES;

function MerchantMatchTypePage({route}: MerchantMatchTypePageProps) {
    const {policyID, ruleID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isEditing = ruleID !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});

    // Default to 'contains' if not set
    const currentMatchType = form?.matchType ?? MATCH_TYPES.CONTAINS;

    const goBack = () => {
        const backRoute = isEditing
            ? ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID)
            : ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID);
        Navigation.goBack(backRoute);
    };

    const items: MatchTypeItem[] = [
        {
            value: MATCH_TYPES.EXACTLY_MATCHES,
            keyForList: MATCH_TYPES.EXACTLY_MATCHES,
            text: translate('workspace.rules.merchantRules.exactlyMatches'),
            isSelected: currentMatchType === MATCH_TYPES.EXACTLY_MATCHES,
        },
        {
            value: MATCH_TYPES.CONTAINS,
            keyForList: MATCH_TYPES.CONTAINS,
            text: translate('workspace.rules.merchantRules.contains'),
            isSelected: currentMatchType === MATCH_TYPES.CONTAINS,
        },
    ];

    const onSelectItem = (selectedItem: MatchTypeItem) => {
        updateDraftMerchantRule({[CONST.MERCHANT_RULES.FIELDS.MATCH_TYPE]: selectedItem.value});
        goBack();
    };

    return (
        <ScreenWrapper
            testID="MerchantMatchTypePage"
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

MerchantMatchTypePage.displayName = 'MerchantMatchTypePage';

export default MerchantMatchTypePage;
