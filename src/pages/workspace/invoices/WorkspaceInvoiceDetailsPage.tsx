import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {StackScreenProps} from '@react-navigation/stack';
import FullPageNotFoundView from '@components/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceInvoiceDetailsPageProps = WithPolicyProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICE_DETAILS>;

function WorkspaceInvoiceDetailsPage({policy, route}: WorkspaceInvoiceDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const invoiceID = route.params?.invoiceID ?? '-1';
    const policyID = route.params?.policyID ?? '-1';

    const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${invoiceID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${invoiceID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceID}`);
    const [paymentTracking] = useOnyx(`${ONYXKEYS.COLLECTION.PAYMENT_TRACKING}${invoiceID}`);

    const isInvoiceReport = ReportUtils.isInvoiceReport(report);
    const shouldShowNotFoundPage = !report || !isInvoiceReport || !PolicyUtils.isPolicyAdmin(policy);

    const invoiceDetails = useMemo(() => {
        if (!report || !reportActions) {
            return null;
        }

        const invoiceData = ReportUtils.getInvoiceDetailsFromReport(report, reportActions);
        const paymentStatus = paymentTracking?.status ?? CONST.PAYMENT_STATUS.UNPAID;
        const paymentSource = paymentTracking?.sourceAccountName;
        const paymentDestination = paymentTracking?.destinationAccountName;
        const paidAmount = paymentTracking?.paidAmount;
        const paymentDate = paymentTracking?.paymentDate;

        return {
            ...invoiceData,
            paymentStatus,
            paymentSource,
            paymentDestination,
            paidAmount,
            paymentDate,
        };
    }, [report, reportActions, paymentTracking]);

    const getPaymentStatusText = () => {
        if (!invoiceDetails) {
            return translate('common.loading');
        }

        switch (invoiceDetails.paymentStatus) {
            case CONST.PAYMENT_STATUS.PAID:
                return translate('iou.paid');
            case CONST.PAYMENT_STATUS.PROCESSING:
                return translate('iou.processing');
            case CONST.PAYMENT_STATUS.FAILED:
                return translate('iou.paymentFailed');
            default:
                return translate('iou.unpaid');
        }
    };

    const getPaymentStatusStyle = () => {
        if (!invoiceDetails) {
            return {};
        }

        switch (invoiceDetails.paymentStatus) {
            case CONST.PAYMENT_STATUS.PAID:
                return styles.textColorReportAction;
            case CONST.PAYMENT_STATUS.PROCESSING:
                return styles.textColorHighlight;
            case CONST.PAYMENT_STATUS.FAILED:
                return styles.textColorAlert;
            default:
                return styles.textColorDisabled;
        }
    };

    if (shouldShowNotFoundPage) {
        return (
            <ScreenWrapper testID={WorkspaceInvoiceDetailsPage.displayName}>
                <FullPageNotFoundView
                    shouldShow
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_INVOICES.getRoute(policyID))}
                    illustration={Illustrations.RocketBlue}
                    minimalAction
                />
            </ScreenWrapper>
        );
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceInvoiceDetailsPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.invoices.invoiceDetails')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_INVOICES.getRoute(policyID))}
                />
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <View style={[styles.flex1, styles.p5]}>
                        {invoiceDetails && (
                            <>
                                <MenuItemWithTopDescription
                                    title={invoiceDetails.invoiceNumber}
                                    description={translate('workspace.invoices.invoiceNumber')}
                                    shouldShowRightIcon={false}
                                />

                                <MenuItemWithTopDescription
                                    title={invoiceDetails.clientName}
                                    description={translate('workspace.invoices.client')}
                                    shouldShowRightIcon={false}
                                />

                                <MenuItemWithTopDescription
                                    title={invoiceDetails.totalAmount}
                                    description={translate('common.total')}
                                    shouldShowRightIcon={false}
                                />

                                <MenuItemWithTopDescription
                                    title={
                                        <Text style={getPaymentStatusStyle()}>
                                            {getPaymentStatusText()}
                                        </Text>
                                    }
                                    description={translate('workspace.invoices.paymentStatus')}
                                    shouldShowRightIcon={false}
                                />

                                {invoiceDetails.paymentSource && (
                                    <MenuItemWithTopDescription
                                        title={invoiceDetails.paymentSource}
                                        description={translate('workspace.invoices.paymentSource')}
                                        shouldShowRightIcon={false}
                                    />
                                )}

                                {invoiceDetails.paymentDestination && (
                                    <MenuItemWithTopDescription
                                        title={invoiceDetails.paymentDestination}
                                        description={translate('workspace.invoices.paymentDestination')}
                                        shouldShowRightIcon={false}
                                    />
                                )}

                                {invoiceDetails.paidAmount && (
                                    <MenuItemWithTopDescription
                                        title={invoiceDetails.paidAmount}
                                        description={translate('workspace.invoices.paidAmount')}
                                        shouldShowRightIcon={false}
                                    />
                                )}

                                {invoiceDetails.paymentDate && (
                                    <MenuItemWithTopDescription
                                        title={invoiceDetails.paymentDate}
                                        description={translate('workspace.invoices.paymentDate')}
                                        shouldShowRightIcon={false}
                                    />
                                )}

                                <MenuItemWithTopDescription
                                    title={invoiceDetails.createdDate}
                                    description={translate('common.created')}
                                    shouldShowRightIcon={false}
                                />

                                {invoiceDetails.dueDate && (
                                    <MenuItemWithTopDescription
                                        title={invoiceDetails.dueDate}
                                        description={translate('workspace.invoices.dueDate')}
                                        shouldShowRightIcon={false}
                                    />
                                )}

                                {invoiceDetails.description && (
                                    <MenuItemWithTopDescription
                                        title={invoiceDetails.description}
                                        description={translate('common.description')}
                                        shouldShowRightIcon={false}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInvoiceDetailsPage.displayName = 'WorkspaceInvoiceDetailsPage';

export default withPolicy(WorkspaceInvoiceDetailsPage);
