import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {deleteReportFieldsListValue, removeReportFieldListValue, setReportFieldsListValueEnabled, updateReportFieldListValueEnabled} from '@libs/actions/Policy/ReportField';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections as hasAccountingConnectionsUtil} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldsValueSettingsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS>;

function ReportFieldsValueSettingsPage({
    policy,
    route: {
        params: {policyID, valueIndex, reportFieldID},
    },
}: ReportFieldsValueSettingsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, {canBeMissing: true});

    const [isDeleteTagModalOpen, setIsDeleteTagModalOpen] = useState(false);

    const [currentValueName, currentValueDisabled] = useMemo(() => {
        let reportFieldValue: string;
        let reportFieldDisabledValue: boolean;

        if (reportFieldID) {
            const reportFieldKey = getReportFieldKey(reportFieldID);

            reportFieldValue = Object.values(policy?.fieldList?.[reportFieldKey]?.values ?? {})?.at(valueIndex) ?? '';
            reportFieldDisabledValue = Object.values(policy?.fieldList?.[reportFieldKey]?.disabledOptions ?? {})?.at(valueIndex) ?? false;
        } else {
            reportFieldValue = formDraft?.listValues?.[valueIndex] ?? '';
            reportFieldDisabledValue = formDraft?.disabledListValues?.[valueIndex] ?? false;
        }

        return [reportFieldValue, reportFieldDisabledValue];
    }, [formDraft?.disabledListValues, formDraft?.listValues, policy?.fieldList, reportFieldID, valueIndex]);

    const hasAccountingConnections = hasAccountingConnectionsUtil(policy);
    const oldValueName = usePrevious(currentValueName);

    if (!currentValueName && !oldValueName) {
        return <NotFoundPage />;
    }
    const deleteListValueAndHideModal = () => {
        if (reportFieldID) {
            removeReportFieldListValue({policy, reportFieldID, valueIndexes: [valueIndex]});
        } else {
            deleteReportFieldsListValue({
                valueIndexes: [valueIndex],
                listValues: formDraft?.listValues ?? [],
                disabledListValues: formDraft?.disabledListValues ?? [],
            });
        }
        setIsDeleteTagModalOpen(false);
        Navigation.goBack();
    };

    const updateListValueEnabled = (value: boolean) => {
        if (reportFieldID) {
            updateReportFieldListValueEnabled({policy, reportFieldID, valueIndexes: [Number(valueIndex)], enabled: value});
            return;
        }

        setReportFieldsListValueEnabled({
            valueIndexes: [valueIndex],
            enabled: value,
            disabledListValues: formDraft?.disabledListValues ?? [],
        });
    };

    const navigateToEditValue = () => {
        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_EDIT_VALUE.getRoute(policyID, valueIndex));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID="ReportFieldsValueSettingsPage"
            >
                <HeaderWithBackButton
                    title={currentValueName ?? oldValueName}
                    shouldSetModalVisibility={false}
                />
                <ConfirmModal
                    title={translate('workspace.reportFields.deleteValue')}
                    isVisible={isDeleteTagModalOpen && !hasAccountingConnections}
                    onConfirm={deleteListValueAndHideModal}
                    onCancel={() => setIsDeleteTagModalOpen(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('workspace.reportFields.deleteValuePrompt')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <View style={styles.flexGrow1}>
                    <View style={[styles.mt2, styles.mh5]}>
                        <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Text>{translate('workspace.reportFields.enableValue')}</Text>
                            <Switch
                                isOn={!currentValueDisabled}
                                accessibilityLabel={translate('workspace.reportFields.enableValue')}
                                onToggle={updateListValueEnabled}
                            />
                        </View>
                    </View>
                    <MenuItemWithTopDescription
                        title={currentValueName ?? oldValueName}
                        description={translate('common.value')}
                        shouldShowRightIcon={!reportFieldID}
                        interactive={!reportFieldID}
                        onPress={navigateToEditValue}
                    />
                    {!hasAccountingConnections && (
                        <MenuItem
                            icon={icons.Trashcan}
                            title={translate('common.delete')}
                            onPress={() => setIsDeleteTagModalOpen(true)}
                        />
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsValueSettingsPage);
