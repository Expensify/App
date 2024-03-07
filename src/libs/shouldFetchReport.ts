import {Report} from '@src/types/onyx';

export default function shouldFetchReport(report: Report) {
    return !report?.isOptimisticReport && !report?.errorFields?.createChat;
}
