import {getRequireFieldsFormFromCategory, getRequireFieldsTableData} from '@libs/RequireFieldsRulesUtils';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';
import type {PolicyCategories} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import {convertToDisplayString, localeCompare, translateLocal} from '../utils/TestHelper';

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
                [INPUT_IDS.DESCRIPTION_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
                [INPUT_IDS.ATTENDEES_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE,
                [INPUT_IDS.RECEIPT_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
                [INPUT_IDS.ITEMIZED_RECEIPT_SETTING]: CONST.FIELD_REQUIREMENTS_DIRECTION.DO_NOT_REQUIRE,
            });
        });
    });

    describe('getRequireFieldsTableData', () => {
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
                translate: translateLocal,
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
