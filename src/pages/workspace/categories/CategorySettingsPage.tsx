import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceCategoryEnabled} from '@libs/actions/Policy';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type CategorySettingsPageOnyxProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type CategorySettingsPageProps = CategorySettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_SETTINGS>;

function CategorySettingsPage({route, policyCategories}: CategorySettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyCategory = policyCategories?.[route.params.categoryName];

    if (!policyCategory) {
        return <NotFoundPage />;
    }

    const updateWorkspaceRequiresCategory = (value: boolean) => {
        setWorkspaceCategoryEnabled(route.params.policyID, {[policyCategory.name]: {name: policyCategory.name, enabled: value}});
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={CategorySettingsPage.displayName}
                >
                    <HeaderWithBackButton title={route.params.categoryName} />
                    <View style={styles.flexGrow1}>
                        <OfflineWithFeedback
                            errors={ErrorUtils.getLatestErrorMessageField(policyCategory)}
                            pendingAction={policyCategory?.pendingFields?.enabled}
                            errorRowStyles={styles.mh5}
                            onClose={() => Policy.clearCategoryErrors(route.params.policyID, route.params.categoryName)}
                        >
                            <View style={[styles.mt2, styles.mh5]}>
                                <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                    <Text>{translate('workspace.categories.enableCategory')}</Text>
                                    <Switch
                                        isOn={policyCategory.enabled}
                                        accessibilityLabel={translate('workspace.categories.enableCategory')}
                                        onToggle={updateWorkspaceRequiresCategory}
                                    />
                                </View>
                            </View>
                        </OfflineWithFeedback>
                        <MenuItemWithTopDescription
                            title={policyCategory.name}
                            description={translate(`workspace.categories.categoryName`)}
                        />
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

CategorySettingsPage.displayName = 'CategorySettingsPage';

export default withOnyx<CategorySettingsPageProps, CategorySettingsPageOnyxProps>({
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
    },
})(CategorySettingsPage);
