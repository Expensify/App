import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import AnimatedEmptyStateBackground from '@pages/inbox/report/AnimatedEmptyStateBackground';

import {View} from 'react-native';

import type {MoneyRequestViewProps} from './MoneyRequestView/types';

import MoneyRequestReceiptView from './MoneyRequestReceiptView';
import AmountField from './MoneyRequestView/components/AmountField';
import AttendeesField from './MoneyRequestView/components/AttendeesField';
import BillableField from './MoneyRequestView/components/BillableField';
import CardField from './MoneyRequestView/components/CardField';
import CategoryField from './MoneyRequestView/components/CategoryField';
import CompanyCardViolationMessage from './MoneyRequestView/components/CompanyCardViolationMessage';
import DateField from './MoneyRequestView/components/DateField';
import DescriptionField from './MoneyRequestView/components/DescriptionField';
import DistanceRequestFields from './MoneyRequestView/components/DistanceRequestFields';
import MerchantField from './MoneyRequestView/components/MerchantField';
import PerDiemOutOfPolicyBanner from './MoneyRequestView/components/PerDiemOutOfPolicyBanner';
import ReimbursableField from './MoneyRequestView/components/ReimbursableField';
import ReportField from './MoneyRequestView/components/ReportField';
import TagField from './MoneyRequestView/components/TagField';
import TaxAmountField from './MoneyRequestView/components/TaxAmountField';
import TaxRateField from './MoneyRequestView/components/TaxRateField';
import TripField from './MoneyRequestView/components/TripField';
import VendorField from './MoneyRequestView/components/VendorField';
import ViewTripDetailsAction from './MoneyRequestView/components/ViewTripDetailsAction';
import useMoneyRequestViewData from './MoneyRequestView/useMoneyRequestViewData';

function MoneyRequestView(props: MoneyRequestViewProps) {
    const data = useMoneyRequestViewData(props);

    if (data.isLoading) {
        return <ReportActionsSkeletonView />;
    }

    const shouldShowDistanceFields =
        data.isManualDistanceRequest || data.isGPSDistanceRequest || data.isOdometerDistanceRequest || (data.isMapDistanceRequest && data.transaction?.comment?.waypoints);

    return (
        <View style={[data.styles.moneyRequestView]}>
            {data.shouldShowAnimatedBackground && <AnimatedEmptyStateBackground />}
            {(!data.isInWideRHP || data.isSmallScreenWidth || data.isFromReviewDuplicates || data.isFromMergeTransaction) && (
                <MoneyRequestReceiptView
                    report={data.transactionThreadReport ?? data.parentReport}
                    readonly={data.readonly}
                    updatedTransaction={data.updatedTransaction}
                    mergeTransactionID={data.mergeTransactionID}
                />
            )}
            {data.isCustomUnitOutOfPolicy && data.isPerDiemRequest && <PerDiemOutOfPolicyBanner data={data} />}
            <AmountField data={data} />
            {!data.shouldHideEmptyDescription && <DescriptionField data={data} />}
            {shouldShowDistanceFields ? <DistanceRequestFields data={data} /> : <MerchantField data={data} />}
            <DateField data={data} />
            {!!data.shouldShowCategory && <CategoryField data={data} />}

            {data.shouldShowVendor && <VendorField data={data} />}
            {!!data.shouldShowTag && <TagField data={data} />}
            {!!data.shouldShowCard && <CardField data={data} />}
            {data.shouldShowTax && <TaxRateField data={data} />}
            {data.shouldShowTax && <TaxAmountField data={data} />}
            {data.shouldShowAttendees && <AttendeesField data={data} />}
            {data.shouldShowReimbursable && <ReimbursableField data={data} />}
            {data.shouldShowBillable && <BillableField data={data} />}
            {data.shouldShowReport && <ReportField data={data} />}
            {data.shouldShowTripRoomLink && <TripField data={data} />}
            {data.shouldShowViewTripDetails && <ViewTripDetailsAction data={data} />}
            {data.hasRequiredCompanyCardViolation && <CompanyCardViolationMessage data={data} />}
        </View>
    );
}

MoneyRequestView.displayName = 'MoneyRequestView';

export default MoneyRequestView;
