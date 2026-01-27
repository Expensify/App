import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftMerchantRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_CATEGORY>;

function AddCategoryPage({route}: AddCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params.policyID;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const selectedCategoryItem = form?.category ? {name: getDecodedCategoryName(form.category), value: form.category} : undefined;

    const categoryItems = useMemo(() => {
        return Object.values(policyCategories ?? {})
            .filter((category) => category.enabled)
            .map((category) => {
                const decodedCategoryName = getDecodedCategoryName(category.name);
                return {name: decodedCategoryName, value: category.name};
            });
    }, [policyCategories]);

    const backToRoute = ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({category: value});
    };

    return (
        <ScreenWrapper
            testID="AddCategoryPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.category')}
                onBackButtonPress={() => Navigation.goBack(backToRoute)}
            />
            <View style={[styles.flex1]}>
                <SearchSingleSelectionPicker
                    backToRoute={backToRoute}
                    initiallySelectedItem={selectedCategoryItem}
                    items={categoryItems}
                    onSaveSelection={onSave}
                    shouldAutoSave
                />
            </View>
        </ScreenWrapper>
    );
}

AddCategoryPage.displayName = 'AddCategoryPage';

export default AddCategoryPage;
