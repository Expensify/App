import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyCategoryAttendeesRequired, setPolicyCategoryDescriptionRequired} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CategoryRequiredFieldsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_REQUIRED_FIELDS>;

function CategoryRequiredFieldsPage({
    route: {
        params: {policyID, categoryName},
    },
}: CategoryRequiredFieldsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const decodedCategoryName = getDecodedCategoryName(categoryName);

    const policyCategory = policyCategories?.[categoryName];
    const areCommentsRequired = policyCategory?.areCommentsRequired ?? false;
    const areAttendeesRequired = policyCategory?.areAttendeesRequired ?? false;
    const isAttendeeTrackingEnabled = policy?.isAttendeeTrackingEnabled ?? false;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={CategoryRequiredFieldsPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.requiredFieldsTitle')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName))}
                />
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1]}
                    addBottomSafeAreaPadding
                >
                    <View style={[styles.mh5, styles.pb5]}>
                        <RenderHTML html={translate('workspace.rules.categoryRules.requiredFieldsDescription', decodedCategoryName)} />
                    </View>
                    <OfflineWithFeedback pendingAction={policyCategory?.pendingFields?.areCommentsRequired}>
                        <View style={[styles.mt2, styles.mh5]}>
                            <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <Text style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.rules.categoryRules.requireDescription')}</Text>
                                <Switch
                                    isOn={areCommentsRequired}
                                    accessibilityLabel={translate('workspace.rules.categoryRules.requireDescription')}
                                    onToggle={() => {
                                        setPolicyCategoryDescriptionRequired(policyID, categoryName, !areCommentsRequired, policyCategories);
                                    }}
                                />
                            </View>
                        </View>
                    </OfflineWithFeedback>
                    {isAttendeeTrackingEnabled && (
                        <OfflineWithFeedback pendingAction={policyCategory?.pendingFields?.areAttendeesRequired}>
                            <View style={[styles.mh5]}>
                                <View style={[styles.flexRow, styles.mv5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                    <Text style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.rules.categoryRules.requireAttendees')}</Text>
                                    <Switch
                                        isOn={areAttendeesRequired}
                                        accessibilityLabel={translate('workspace.rules.categoryRules.requireAttendees')}
                                        onToggle={() => {
                                            setPolicyCategoryAttendeesRequired(policyID, categoryName, !areAttendeesRequired, policyCategories);
                                        }}
                                    />
                                </View>
                            </View>
                        </OfflineWithFeedback>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

CategoryRequiredFieldsPage.displayName = 'CategoryRequiredFieldsPage';

export default CategoryRequiredFieldsPage;
