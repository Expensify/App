import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxProvider';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepSplitPayerProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function IOURequestStepSplitPayer({
    route: {
        params: {iouType, transactionID, action, backTo},
    },
    transaction,
    report,
}: IOURequestStepSplitPayerProps) {
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const currentUserOption = useMemo(
        () => ({
            accountID: currentUserPersonalDetails.accountID,
            searchText: currentUserPersonalDetails.login,
            selected: true,
        }),
        [currentUserPersonalDetails],
    );

    const sections = useMemo(() => {
        const participants = transaction?.participants ?? [];
        const participantOptions =
            [currentUserOption, ...participants]
                ?.filter((participant) => !!participant.accountID)
                ?.map((participant) => OptionsListUtils.getParticipantsOption(participant, personalDetails)) ?? [];
        return [
            {
                title: '',
                data: participantOptions.map((participantOption) => ({
                    ...participantOption,
                    isSelected: !!transaction?.splitPayerAccountIDs && transaction?.splitPayerAccountIDs?.includes(participantOption.accountID),
                })),
            },
        ];
    }, [transaction?.participants, personalDetails, transaction?.splitPayerAccountIDs, currentUserOption]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const setSplitPayer = (item: Participant | OptionData) => {
        IOU.setSplitPayer(transactionID, item.accountID);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('moneyRequestConfirmationList.paidBy')}
            onBackButtonPress={navigateBack}
            shouldShowNotFoundPage={
                !IOUUtils.isValidMoneyRequestType(iouType) || ReportUtils.isPolicyExpenseChat(report) || action !== CONST.IOU.ACTION.CREATE || iouType !== CONST.IOU.TYPE.SPLIT
            }
            shouldShowWrapper
            testID={IOURequestStepSplitPayer.displayName}
        >
            <SelectionList
                sections={sections}
                ListItem={UserListItem}
                onSelectRow={setSplitPayer}
                shouldSingleExecuteRowSelect
                showLoadingPlaceholder={!didScreenTransitionEnd}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepSplitPayer.displayName = 'IOURequestStepSplitPayer';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepSplitPayerWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepSplitPayer);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepSplitPayerWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepSplitPayerWithWritableReportOrNotFound);

export default IOURequestStepSplitPayerWithFullTransactionOrNotFound;
