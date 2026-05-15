import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {setPolicyCategoryAttendeesRequired, setPolicyCategoryDescriptionRequired} from '@userActions/Policy/Category';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicCategoryRequiredFieldsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRED_FIELDS>;

function DynamicCategoryRequiredFieldsPage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicCategoryRequiredFieldsPageProps) {
    const styles = useThemeStyles();
    const categorySettingsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_REQUIRED_FIELDS.path);
    const {translate} = useLocalize();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const decodedCategoryName = getDecodedCategoryName(categoryName);

    const policyCategory = policyCategories?.[categoryName];
    const areCommentsRequired = policyCategory?.areCommentsRequired ?? false;
    const areAttendeesRequired = policyCategory?.areAttendeesRequired ?? false;
    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={DynamicCategoryRequiredFieldsPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.requiredFieldsTitle')}
                    onBackButtonPress={() => Navigation.goBack(categorySettingsBackPath)}
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
                                <Text
                                    style={[styles.flexShrink1, styles.mr2]}
                                    accessible={false}
                                    aria-hidden
                                >
                                    {translate('workspace.rules.categoryRules.requireDescription')}
                                </Text>
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
                    {isAttendeeTrackingEnabled(policy) && (
                        <OfflineWithFeedback pendingAction={policyCategory?.pendingFields?.areAttendeesRequired}>
                            <View style={[styles.mh5]}>
                                <View style={[styles.flexRow, styles.mv5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                    <Text
                                        style={[styles.flexShrink1, styles.mr2]}
                                        accessible={false}
                                        aria-hidden
                                    >
                                        {translate('workspace.rules.categoryRules.requireAttendees')}
                                    </Text>
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

DynamicCategoryRequiredFieldsPage.displayName = 'DynamicCategoryRequiredFieldsPage';

export default DynamicCategoryRequiredFieldsPage;
