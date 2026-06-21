import type {ReactNode} from 'react';
import type {MutationFn} from 'react-call/mutation-flow';
import type {OnyxEntry} from 'react-native-onyx';
import type {ActionVariant} from '@components/Modal/v2/confirm/Action';
import type {BannerFit} from '@components/Modal/v2/confirm/Banner';
import type {OptionVariant} from '@components/Modal/v2/decision/Option';
import type {ActionHandledType} from '@hooks/useHoldMenuSubmit';
import type HrSyncResult from '@libs/API/HrSyncResult';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import type {DialogResponse} from './actions';

type ConfirmSubmit = {
    text?: string;
    variant?: ActionVariant;
};

type ConfirmCancel = {
    text?: string;
};

type ConfirmIcon = {
    src: IconAsset;
    fill?: string;
};

type ConfirmBanner = {
    src: IconAsset;
    fit?: BannerFit;
};

type ConfirmCallProps = {
    title?: string;
    prompt?: ReactNode;
    submit?: ConfirmSubmit;
    cancel?: ConfirmCancel;
    icon?: ConfirmIcon;
    banner?: ConfirmBanner;
    onBackdropPress?: () => void;
    onConfirm?: MutationFn<DialogResponse>;
};

type DecisionCommonProps = {
    title: string;
    prompt?: string;
    secondOptionText: string;
    secondOptionVariant: OptionVariant;
};

type DecisionDualOptionProps = DecisionCommonProps & {
    firstOptionText: string;
    firstOptionVariant: OptionVariant;
};

type DecisionSoleOptionProps = DecisionCommonProps & {
    firstOptionText?: undefined;
    firstOptionVariant?: undefined;
};

type DecisionCallProps = DecisionDualOptionProps | DecisionSoleOptionProps;

type HoldMenuCommonProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
    requestType: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    fullAmount: string;
    onConfirm?: (full: boolean) => void;
    moneyRequestReport?: OnyxEntry<Report>;
    chatReport?: OnyxEntry<Report>;
};

type HoldMenuPartialProps = HoldMenuCommonProps & {
    nonHeldAmount: string;
    transactionCount?: undefined;
};

type HoldMenuFullProps = HoldMenuCommonProps & {
    nonHeldAmount?: undefined;
    transactionCount: number;
};

type HoldMenuCallProps = HoldMenuPartialProps | HoldMenuFullProps;

type HRSyncResultsCallProps = {
    result: HrSyncResult;
    policyID: string;
};

export type {ConfirmCallProps, DecisionCallProps, HoldMenuCallProps, HRSyncResultsCallProps};
