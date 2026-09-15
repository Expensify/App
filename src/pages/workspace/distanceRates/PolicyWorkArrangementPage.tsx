import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkArrangementSelector from '@components/WorkArrangementSelector';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {clearPolicyCommuterExclusionsErrors, setPolicyWorkArrangement} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type PolicyWorkArrangementPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_WORK_ARRANGEMENT>;

function PolicyWorkArrangementPage({route}: PolicyWorkArrangementPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isCommuterExclusionsEnabled = isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS);

    const [policyData] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: (policy) => ({
            isOfficeWorkArrangement: policy?.commuterExclusions?.isOfficeWorkArrangement,
            isHomeAndOfficeMethod: policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE,
            pendingFields: policy?.pendingFields,
            errorFields: policy?.errorFields,
        }),
    });

    const onSelect = (isOffice: boolean) => {
        if (isOffice !== policyData?.isOfficeWorkArrangement) {
            setPolicyWorkArrangement(policyID, isOffice, policyData?.isOfficeWorkArrangement);
        }
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
            shouldBeBlocked={!isCommuterExclusionsEnabled || !policyData?.isHomeAndOfficeMethod}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="PolicyWorkArrangementPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.distanceRates.commuterExclusions.workArrangement.title')} />
                <OfflineWithFeedback
                    errors={getLatestErrorField(policyData ?? {}, 'commuterExclusions')}
                    pendingAction={policyData?.pendingFields?.commuterExclusions}
                    errorRowStyles={styles.mh5}
                    onClose={() => clearPolicyCommuterExclusionsErrors(policyID)}
                    style={styles.flex1}
                    contentContainerStyle={styles.flex1}
                >
                    <View style={styles.ph5}>
                        <WorkArrangementSelector
                            isOffice={policyData?.isOfficeWorkArrangement}
                            onSelect={onSelect}
                        />
                    </View>
                </OfflineWithFeedback>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyWorkArrangementPage;
