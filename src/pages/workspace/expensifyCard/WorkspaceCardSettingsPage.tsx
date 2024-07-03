import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

function WorkspaceCardSettingsPage({route}: StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceCardSettingsPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.common.settings')} />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <View>
                        <OfflineWithFeedback
                            // errors={ErrorUtils.getLatestErrorField(customUnits[customUnitID] ?? {}, 'attributes')}
                            // pendingAction={''}
                            errorRowStyles={styles.mh5}
                            // onClose={() => clearErrorFields('attributes')}
                        >
                            <MenuItemWithTopDescription
                                description="Settlement account"
                                title="xxxxxxxxxxxx1234"
                                shouldShowRightIcon
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback
                            // errors={ErrorUtils.getLatestErrorField(customUnits[customUnitID] ?? {}, 'defaultCategory')}
                            // pendingAction={customUnits[customUnitID]?.pendingFields?.defaultCategory}
                            errorRowStyles={styles.mh5}
                            // onClose={() => clearErrorFields('defaultCategory')}
                        >
                            <MenuItemWithTopDescription
                                description="Settlement frequency"
                                title="Monthly"
                                shouldShowRightIcon
                            />
                        </OfflineWithFeedback>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCardSettingsPage.displayName = 'WorkspaceCardSettingsPage';

export default WorkspaceCardSettingsPage;
