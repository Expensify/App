import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {updateReportField} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {ReportFieldItemType} from './ReportFieldTypePicker';
import ReportFieldTypePicker from './ReportFieldTypePicker';

type ReportFieldsEditTypePageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_TYPE>;

function ReportFieldsEditTypePage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsEditTypePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const reportFieldKey = getReportFieldKey(reportFieldID);
    const reportField = policy?.fieldList?.[reportFieldKey];
    const currentType = reportField?.type;

    const onTypeSelected = useCallback(
        (reportFieldType: ReportFieldItemType) => {
            if (currentType && reportFieldType.value !== currentType) {
                updateReportField(policyID, reportFieldID, {type: reportFieldType.value});
            }
            Navigation.goBack();
        },
        [currentType, policyID, reportFieldID],
    );

    if (!currentType) {
        return null;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
            shouldBeBlocked={hasAccountingConnections(policy)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={ReportFieldsEditTypePage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.type')}
                    onBackButtonPress={Navigation.goBack}
                />
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.reportFields.typeInputSubtitle')}</Text>
                </View>
                <ReportFieldTypePicker
                    defaultValue={currentType}
                    onOptionSelected={onTypeSelected}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ReportFieldsEditTypePage.displayName = 'ReportFieldsEditTypePage';

export default withPolicyAndFullscreenLoading(ReportFieldsEditTypePage);
