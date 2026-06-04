import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {deleteReportFieldsListValue, removeReportFieldListValue, setReportFieldsListValueEnabled, updateReportFieldListValueEnabled} from '@libs/actions/Policy/ReportField';
import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections as hasAccountingConnectionsUtil} from '@libs/PolicyUtils';
import type {PolicyFeature} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route as Routes} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type FieldsValueSettingsPageProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    valueIndex: number;
    reportFieldID?: string;
    isInvoicePage: boolean;
    featureName: ValueOf<typeof CONST.POLICY.MORE_FEATURES>;
    policyFeature: PolicyFeature;
    getEditValueRoute: (isInvoiceRoute: boolean, policyID: string, valueIndex: number) => Routes;
    testID: string;
};

function FieldsValueSettingsPage({policy, policyID, valueIndex, reportFieldID, isInvoicePage, featureName, policyFeature, getEditValueRoute, testID}: FieldsValueSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);
    const {showConfirmModal} = useConfirmModal();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const {canWrite, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, policyFeature);

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
    const reportField = reportFieldID ? policy?.fieldList?.[getReportFieldKey(reportFieldID)] : undefined;
    const shouldUseInvoiceRoutes = isInvoicePage || reportField?.target === CONST.REPORT_FIELD_TARGETS.INVOICE;

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
        Navigation.goBack();
    };

    const showDeleteModal = () => {
        showConfirmModal({
            danger: true,
            title: translate('workspace.reportFields.deleteValue'),
            prompt: translate('workspace.reportFields.deleteValuePrompt'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            deleteListValueAndHideModal();
        });
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
        Navigation.navigate(getEditValueRoute(shouldUseInvoiceRoutes, policyID, valueIndex));
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={featureName}
            policyFeature={policyFeature}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={styles.defaultModalContainer}
                testID={testID}
            >
                <HeaderWithBackButton
                    title={currentValueName ?? oldValueName}
                    shouldSetModalVisibility={false}
                />
                <View style={styles.flexGrow1}>
                    <View style={[styles.mt2, styles.mh5]}>
                        <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Text
                                accessible={false}
                                aria-hidden
                            >
                                {translate('workspace.reportFields.enableValue')}
                            </Text>
                            <Switch
                                isOn={!currentValueDisabled}
                                accessibilityLabel={translate('workspace.reportFields.enableValue')}
                                onToggle={updateListValueEnabled}
                                disabled={!canWrite}
                                disabledAction={withReadOnlyFallback()}
                                showLockIcon={!canWrite}
                            />
                        </View>
                    </View>
                    <MenuItemWithTopDescription
                        title={currentValueName ?? oldValueName}
                        description={translate('common.value')}
                        shouldShowRightIcon={canWrite && !reportFieldID}
                        interactive={canWrite && !reportFieldID}
                        onPress={navigateToEditValue}
                    />
                    {canWrite && !hasAccountingConnections && (
                        <MenuItem
                            icon={icons.Trashcan}
                            title={translate('common.delete')}
                            onPress={showDeleteModal}
                        />
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FieldsValueSettingsPage;
