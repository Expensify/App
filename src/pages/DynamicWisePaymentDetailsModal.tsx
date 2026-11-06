import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import CenteredModalLayout from '@components/CenteredModalLayout';
import HeaderTitle from '@components/HeaderTitle';
import ScrollView from '@components/ScrollView';
import WisePaymentSummary from '@components/WisePaymentSummary';
import {getLatestPaidWisePaymentAmounts} from '@components/WisePaymentSummary/utils/getPaidWisePaymentAmounts';
import getWisePaymentSummaryRows from '@components/WisePaymentSummary/utils/getWisePaymentSummaryRows';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FeatureTrainingNavigatorParamList} from '@libs/Navigation/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type DynamicWisePaymentDetailsModalProps = PlatformStackScreenProps<FeatureTrainingNavigatorParamList, typeof SCREENS.DYNAMIC_PAYMENT_DETAILS_ROOT>;

/** The final fees, amounts and FX rate of a report paid through Wise, which Wise requires to stay visible after payment */
function DynamicWisePaymentDetailsModal({route}: DynamicWisePaymentDetailsModalProps) {
    const reportID = route.params.reportID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.PAYMENT_DETAILS.path);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [amounts] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: getLatestPaidWisePaymentAmounts});

    const close = () => Navigation.goBack(backPath);

    return (
        <FullPageNotFoundView
            shouldShow={!report || !amounts}
            onBackButtonPress={close}
        >
            <CenteredModalLayout
                onBackdropPress={close}
                width={variables.sideBarWidth}
                contentStyle={[styles.pb0, styles.flexShrink1]}
            >
                {/* The rows can outgrow a short window, so they scroll while Got it stays in view */}
                <ScrollView
                    style={styles.flexShrink1}
                    contentContainerStyle={[styles.ph5, styles.pt5]}
                >
                    <HeaderTitle style={styles.mb5}>
                        <HeaderTitle.Text>{translate('iou.wisePaymentSummary.paymentDetails')}</HeaderTitle.Text>
                    </HeaderTitle>
                    {!!report && !!amounts && (
                        <WisePaymentSummary
                            reportID={reportID}
                            rows={getWisePaymentSummaryRows({report, amounts, isPayingUnheldOnly: false, isPaid: true, translate, convertToDisplayString})}
                        />
                    )}
                </ScrollView>
                <Button
                    style={styles.m5}
                    onPress={close}
                    size={CONST.BUTTON_SIZE.LARGE}
                    sentryLabel={CONST.SENTRY_LABEL.WISE_PAYMENT_DETAILS.GOT_IT}
                >
                    <Button.Text>{translate('common.buttonConfirm')}</Button.Text>
                </Button>
            </CenteredModalLayout>
        </FullPageNotFoundView>
    );
}

export default DynamicWisePaymentDetailsModal;
