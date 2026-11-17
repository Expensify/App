/**
 * GetInsights returns each group's dimension as `value`, while Search names it (`accountID`, `violation`, `workflowStage`).
 * Renaming it lets Insights charts reuse the Search grouping code. It can be removed once the backend names the field.
 */
import type {SearchGroupBy} from '@components/Search/types';

import {isGroupEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** The field the Search grouping code reads a group's dimension from */
const GROUP_FIELD_NAMES: Partial<Record<SearchGroupBy, 'accountID' | 'violation' | 'workflowStage'>> = {
    [CONST.SEARCH.GROUP_BY.FROM]: 'accountID',
    [CONST.SEARCH.GROUP_BY.APPROVER]: 'accountID',
    [CONST.SEARCH.GROUP_BY.VIOLATION]: 'violation',
    [CONST.SEARCH.GROUP_BY.PAID_BY]: 'accountID',
    [CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE]: 'workflowStage',
};

/** Copies each group's `value` into the field its grouping names, leaving groups that already have it untouched. */
function normalizeInsightsSnapshot(snapshot: OnyxEntry<SearchResults>, groupBy: SearchGroupBy | undefined): OnyxEntry<SearchResults> {
    const fieldName = groupBy ? GROUP_FIELD_NAMES[groupBy] : undefined;
    if (!snapshot?.data || !fieldName) {
        return snapshot;
    }

    const data = snapshot.data;
    let normalizedData: SearchResults['data'] | undefined;
    for (const key in data) {
        if (!isGroupEntry(key)) {
            continue;
        }
        const group = data[key];
        if (fieldName in group || !('value' in group)) {
            continue;
        }
        normalizedData ??= {...data};
        normalizedData[key] = {...group, [fieldName]: group.value};
    }

    return normalizedData ? {...snapshot, data: normalizedData} : snapshot;
}

export default normalizeInsightsSnapshot;
