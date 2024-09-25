import type {OnyxEntry} from 'react-native-onyx';
import type Report from '@src/types/onyx/Report';

export default function shouldFetchReport(report: OnyxEntry<Report>) {
    // If the report is optimistic, there's no need to fetch it. The original action should create it.
    // If there is an error for creating the chat, there's no need to fetch it since it doesn't exist
    return !report?.isOptimisticReport && !report?.errorFields?.createChat;
}
