import {useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SelectedReports} from '@components/Search/types';

import {bulkDuplicateReports} from '@libs/actions/IOU/Duplicate';
import {getPolicyExpenseChat} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import usePermissions from './usePermissions';

type UseBulkDuplicateReportActionParams = {
    selectedReports: SelectedReports[];
    allReports: OnyxCollection<Report> | undefined;
    searchData: Record<string, unknown> | undefined;
};

function useBulkDuplicateReportAction({selectedReports, allReports, searchData}: UseBulkDuplicateReportActionParams) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();

    const handleDuplicateReports = () => {
        const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id);

        bulkDuplicateReports({
            dateFnsLocale,
            selectedReports,
            allReports: allReports ?? {},
            searchData,
            defaultExpensePolicy,
            activePolicyExpenseChat,
            ownerPersonalDetails: currentUserPersonalDetails,
            isASAPSubmitBetaEnabled,
            translate,
            currentUserLogin: currentUserPersonalDetails.login ?? '',
            currentUserAccountID: currentUserPersonalDetails?.accountID,
            delegateAccountID,
            formatPhoneNumber,
            getCurrencyDecimals,
        });

        clearSelectedTransactions(undefined, true);
    };

    return handleDuplicateReports;
}

export default useBulkDuplicateReportAction;
