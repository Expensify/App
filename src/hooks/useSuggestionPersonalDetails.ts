import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxProvider';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

function useSuggestionPersonalDetails(report: OnyxEntry<Report>): PersonalDetailsList {
    const personalDetails = usePersonalDetails();
    const isGroupChat = ReportUtils.isGroupChat(report);
    const isDM = ReportUtils.isDM(report);
    const policyMembersIds = report?.policyID ? getPolicyEmployeeAccountIDs(report?.policyID) : [];

    let filteredDetails: PersonalDetailsList = [];
    if (policyMembersIds.length > 0) {
        filteredDetails = Object.values(personalDetails).filter((detail) => policyMembersIds.includes(detail.accountID));
    } else {
        filteredDetails = isGroupChat || isDM ? Object.values(personalDetails).filter((detail) => ReportUtils.isReportParticipant(detail.accountID, report)) : personalDetails;
    }

    return filteredDetails;
}

export default useSuggestionPersonalDetails;
