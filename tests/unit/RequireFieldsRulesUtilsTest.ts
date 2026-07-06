import {getRequireFieldsFormFromCategory, getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';

import CONST from '@src/CONST';
import type {PolicyCategories} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

describe('RequireFieldsRulesUtils', () => {
    describe('getRequireFieldsFormFromCategory', () => {
        it('treats fields pending delete as disabled', () => {
            const category = {
                name: 'Meals',
                enabled: true,
                areCommentsRequired: true,
                areAttendeesRequired: true,
                pendingFields: {
                    areCommentsRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    areAttendeesRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            };

            expect(getRequireFieldsFormFromCategory(category)).toEqual({
                requireDescription: false,
                requireAttendees: true,
                requireReceipt: false,
                requireItemizedReceipt: false,
            });
        });
    });

    describe('getRequireFieldsTableData', () => {
        const translate = ((key: string) => key) as Parameters<typeof getRequireFieldsTableData>[0]['translate'];
        const convertToDisplayString = ((amount: number | undefined) => `$${amount ?? 0}`) as Parameters<typeof getRequireFieldsTableData>[0]['convertToDisplayString'];
        const localeCompare = (a: string, b: string) => a.localeCompare(b);
        const onNavigate = jest.fn();

        it('keeps rows visible while a field is pending delete', () => {
            const policyCategories: PolicyCategories = {
                Meals: {
                    name: 'Meals',
                    enabled: true,
                    areCommentsRequired: true,
                    areAttendeesRequired: true,
                    pendingFields: {
                        areCommentsRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            };

            const tableData = getRequireFieldsTableData({
                policy: createRandomPolicy(0),
                policyCategories,
                translate,
                convertToDisplayString,
                localeCompare,
                isOffline: false,
                onNavigate,
            });

            expect(tableData).toHaveLength(1);
            expect(tableData.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(tableData.at(0)?.disabled).toBe(false);
        });
    });
});
