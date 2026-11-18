import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {TransactionWorkflowStageGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSections, getSortedSections, getValidGroupBy} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import {convertToDisplayString, formatPhoneNumber, localeCompare, translateLocal} from '../../utils/TestHelper';

const WORKFLOW_STAGE_DATA: SearchResults['data'] = {
    [`${CONST.SEARCH.GROUP_PREFIX}${CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID}` as const]: {
        workflowStage: CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID,
        averageDuration: 3600,
        count: 2,
        currency: 'USD',
        total: 1000,
    },
    [`${CONST.SEARCH.GROUP_PREFIX}${CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED}` as const]: {
        workflowStage: CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED,
        averageDuration: 86400,
        count: 9,
        currency: 'USD',
        total: 5000,
    },
    [`${CONST.SEARCH.GROUP_PREFIX}${CONST.SEARCH.WORKFLOW_STAGES.SUBMITTED_APPROVED}` as const]: {
        workflowStage: CONST.SEARCH.WORKFLOW_STAGES.SUBMITTED_APPROVED,
        averageDuration: null,
        count: 0,
        currency: 'USD',
        total: 0,
    },
};

function buildWorkflowStageSections(): TransactionWorkflowStageGroupListItemType[] {
    const queryJSON = buildSearchQueryJSON(`type:expense-report group-by:${CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE}`);
    if (!queryJSON) {
        throw new Error('Failed to build the workflow stage query');
    }

    const [sections] = getSections({
        dateFnsLocale: undefined,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        data: WORKFLOW_STAGE_DATA,
        groupBy: CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE,
        queryJSON,
        currentAccountID: 1,
        currentUserEmail: 'me@example.com',
        translate: translateLocal,
        formatPhoneNumber,
        bankAccountList: undefined,
        rules: undefined,
        conciergeReportID: undefined,
        convertToDisplayString,
        reportAttributesDerivedValue: undefined,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- getSections returns the union of every grouping's rows
    return sections as TransactionWorkflowStageGroupListItemType[];
}

describe('workflow stage grouping', () => {
    it('builds a row per stage with its translated label and average duration', () => {
        // Given groups of every workflow stage, one of which no report completed
        // When its rows are built
        const sections = buildWorkflowStageSections();

        // Then every stage gets a row with its label, and the stage nobody completed keeps a null duration rather than a zero
        const rowsByStage = Object.fromEntries(sections.map((section) => [section.workflowStage, section]));
        expect(sections).toHaveLength(3);
        expect(rowsByStage[CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED]).toMatchObject({
            groupedBy: CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE,
            formattedWorkflowStage: translateLocal('search.workflowStages.created-submitted'),
            averageDuration: 86400,
            count: 9,
        });
        expect(rowsByStage[CONST.SEARCH.WORKFLOW_STAGES.SUBMITTED_APPROVED]?.averageDuration).toBeNull();
        expect(rowsByStage[CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID]?.formattedWorkflowStage).toBe(translateLocal('search.workflowStages.approved-paid'));
    });

    it('ranks the stages by average duration', () => {
        // Given the rows of every stage
        const sections = buildWorkflowStageSections();

        // When they are sorted by average time, the way the Average processing time chart asks for
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- getSortedSections returns the union of every grouping's rows
        const sorted = getSortedSections(
            CONST.SEARCH.DATA_TYPES.EXPENSE,
            sections,
            localeCompare,
            translateLocal,
            CONST.SEARCH.SORT_BY_COLUMNS.AVERAGE_TIME,
            CONST.SEARCH.SORT_ORDER.DESC,
            CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE,
        ) as TransactionWorkflowStageGroupListItemType[];

        // Then the slowest stage comes first
        expect(sorted.slice(0, 2).map((section) => section.workflowStage)).toEqual([CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED, CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID]);
    });

    it('labels chart points by stage and drills in by the stage filter', () => {
        // Given the row of a stage
        const row = buildWorkflowStageSections().find((section) => section.workflowStage === CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED);
        if (!row) {
            throw new Error('Expected a created-submitted row');
        }

        // When a chart reads its label and drill-in query
        const config = CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE];

        // Then the label is the stage's name, and the drill-in narrows the query to that stage
        expect(config.getLabel(row)).toBe(translateLocal('search.workflowStages.created-submitted'));
        expect(config.getFilterQuery(row)).toBe(`${CONST.SEARCH.SYNTAX_FILTER_KEYS.WORKFLOW_STAGE}:${CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED}`);
    });

    it('treats a typed Spend group-by:workflow-stage as having no group-by', () => {
        // Given a Spend query with workflow stage typed in as its group-by
        const queryJSON = buildSearchQueryJSON(`type:expense group-by:${CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE}`);

        // When Search resolves the group-by it lists the expenses by
        const groupBy = getValidGroupBy(queryJSON?.groupBy);

        // Then the query keeps the value Insights charts ask for, while Search lists the expenses ungrouped
        expect(queryJSON?.groupBy).toBe(CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE);
        expect(groupBy).toBeUndefined();
    });
});
