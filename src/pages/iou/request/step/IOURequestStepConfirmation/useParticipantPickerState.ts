import useDefaultParticipants from '@hooks/useDefaultParticipants';

import {setTransactionReport} from '@libs/actions/Transaction';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';

import {setMoneyRequestParticipants} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import type {IOURequestStepConfirmationProps} from './types';

type UseParticipantPickerStateParams = {
    transaction: OnyxEntry<Transaction>;
    iouType: IOUType;
    action: IOUAction;
    reportID: string;
    reportDrafts: OnyxCollection<Report>;
    navigation: IOURequestStepConfirmationProps['navigation'];
    isManualRequest: boolean;
};

/**
 * Owns the confirmation's "To" picker: assigning default participants and opening the participants page, from the
 * "To" row or on its own for a manual expense with no recipient.
 */
function useParticipantPickerState({transaction, iouType, action, reportID, reportDrafts, navigation, isManualRequest}: UseParticipantPickerStateParams) {
    const isFocused = useIsFocused();
    const sourceReportID = transaction?.reportID ?? reportID;
    const sourceReport = sourceReportID
        ? getReportOrDraftReport(sourceReportID, undefined, undefined, reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${sourceReportID}`] ?? {})
        : undefined;
    const {participants: resolvedDefaultParticipants, isLoading: isLoadingDefaultParticipants} = useDefaultParticipants({sourceReport, transaction, iouType});
    const hasSelectedParticipants = (transaction?.participants ?? []).some((participant) => participant?.selected);

    // Don't override the participants the user has already selected, and bail when there is no source report. The shared
    // empty array keeps the reference stable, so the auto-assign effect below doesn't re-run on every render.
    const defaultParticipants = hasSelectedParticipants || !sourceReportID ? getEmptyArray<Participant>() : resolvedDefaultParticipants;

    const transactionParticipants = transaction?.participants ?? [];
    const shouldAutoOpenParticipantPicker =
        !!transaction?.transactionID && transactionParticipants.length === 0 && defaultParticipants.length === 0 && !isLoadingDefaultParticipants && isManualRequest;
    const activeTransactionID = transaction?.transactionID;

    const openParticipantPicker = () => {
        if (!activeTransactionID) {
            return;
        }
        Navigation.navigate(
            createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute({action, iouType, transactionID: activeTransactionID, reportID, isFromConfirmation: true})),
        );
    };

    // Opens on its own once per expense, so coming back without a pick doesn't reopen it.
    const autoOpenedForTransactionIDRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        // The confirmation is also a tab of `IOURequestStartPage`, so only the focused tab opens it.
        if (!shouldAutoOpenParticipantPicker || !isFocused || autoOpenedForTransactionIDRef.current === activeTransactionID) {
            return;
        }
        autoOpenedForTransactionIDRef.current = activeTransactionID;
        openParticipantPicker();
    }, [shouldAutoOpenParticipantPicker, isFocused, activeTransactionID, openParticipantPicker]);

    useEffect(() => {
        if (!transaction?.transactionID) {
            return;
        }

        const hasTransactionParticipants = (transaction?.participants ?? []).length > 0;
        const hasDefaultParticipants = defaultParticipants.length > 0;

        if (hasTransactionParticipants || !hasDefaultParticipants) {
            return;
        }

        setMoneyRequestParticipants(transaction.transactionID, defaultParticipants);
        const firstDefault = defaultParticipants.at(0);
        if (firstDefault?.isSelfDM) {
            setTransactionReport(transaction.transactionID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
            navigation.setParams({iouType: CONST.IOU.TYPE.TRACK});
        } else if (firstDefault?.reportID) {
            setTransactionReport(transaction.transactionID, {reportID: firstDefault.reportID}, true);
        }
    }, [transaction?.transactionID, transaction?.participants, defaultParticipants, navigation]);

    return {
        defaultParticipants,
        openParticipantPicker,
    };
}

export default useParticipantPickerState;
