import React from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import CustomUnitDefaultCategorySelector from '@components/CustomUnitDefaultCategorySelector';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearPolicyPerDiemRatesErrorFields} from '@libs/actions/Policy/PerDiem';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {CustomUnit} from '@src/types/onyx/Policy';

type WorkspacePerDiemSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_SETTINGS>;

function WorkspacePerDiemSettingsPage({route}: WorkspacePerDiemSettingsPageProps) {
    const policyID = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const customUnit = getPerDiemCustomUnit(policy);
    const customUnitID = customUnit?.customUnitID;

    const defaultCategory = customUnit?.defaultCategory;
    const errorFields = customUnit?.errorFields;

    const FullPageBlockingView = !customUnit ? FullPageOfflineBlockingView : View;

    const clearErrorFields = (fieldName: keyof CustomUnit) => {
        if (!customUnitID) {
            return;
        }
        clearPolicyPerDiemRatesErrorFields(policyID, customUnitID, {...errorFields, [fieldName]: null});
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspacePerDiemSettingsPage"
            >
                <HeaderWithBackButton title={translate('workspace.common.settings')} />
                <FullPageBlockingView
                    style={customUnit ? styles.flexGrow1 : []}
                    addBottomSafeAreaPadding
                >
                    <ScrollView
                        addBottomSafeAreaPadding
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="always"
                    >
                        {!!policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {}) && !!customUnitID && (
                            <OfflineWithFeedback
                                errors={getLatestErrorField(customUnit ?? {}, 'defaultCategory')}
                                pendingAction={customUnit?.pendingFields?.defaultCategory}
                                errorRowStyles={styles.mh5}
                                onClose={() => clearErrorFields('defaultCategory')}
                            >
                                <CustomUnitDefaultCategorySelector
                                    label={translate('workspace.common.defaultCategory')}
                                    defaultValue={defaultCategory}
                                    wrapperStyle={[styles.ph5, styles.mt3]}
                                    customUnitID={customUnitID}
                                />
                            </OfflineWithFeedback>
                        )}
                    </ScrollView>
                </FullPageBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspacePerDiemSettingsPage;
