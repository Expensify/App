import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as ReportField from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceReportFieldSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELD_SETTINGS>;

function WorkspaceReportFieldSettings({route}: WorkspaceReportFieldSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
    const reportFieldKey = ReportUtils.getReportFieldKey(route.params.reportFieldKey);
    const currentPolicyReportField = policy?.fieldList?.[reportFieldKey];
    if (!currentPolicyReportField) {
        return <NotFoundPage />;
    }

    const deleteReportFieldAndHideModal = () => {
        ReportField.deleteReportFields(route.params.policyID, [reportFieldKey]);
        setIsDeleteModalVisible(false);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceReportFieldSettings.displayName}
            >
                <HeaderWithBackButton
                    title={currentPolicyReportField.name}
                    shouldSetModalVisibility={false}
                />
                <ConfirmModal
                    title={translate('workspace.reportFields.delete')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={deleteReportFieldAndHideModal}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('workspace.reportFields.deleteConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <View style={styles.flexGrow1}>
                    <MenuItem
                        icon={Expensicons.Trashcan}
                        title={translate('common.delete')}
                        onPress={() => setIsDeleteModalVisible(true)}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceReportFieldSettings.displayName = 'WorkspaceReportFieldSettings';

export default WorkspaceReportFieldSettings;
