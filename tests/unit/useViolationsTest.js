import {renderHook} from '@testing-library/react-native';
import lodashForEach from 'lodash/forEach';
import lodashKeys from 'lodash/keys';
import lodashMap from 'lodash/map';
import lodashValues from 'lodash/values';
import {useViolations, violationFields} from '@libs/Violations/useViolations';

const violationNames = lodashKeys(violationFields);
const fieldNames = lodashValues(violationFields);

const allViolations = lodashMap(violationNames, (name) => ({name}));

const violationsByField = {};
lodashForEach(allViolations, (violation) => {
    const field = violationFields[violation.name];
    const fieldViolations = violationsByField[field] || [];
    violationsByField[field] = [...fieldViolations, violation];
});

describe('useViolations', () => {
    let violations = [];

    beforeEach(() => {
        violations = [...allViolations];
    });

    // The happy path
    function callHook() {
        const {result, rerender} = renderHook(() => useViolations(violations));
        return {result, rerender};
    }

    it('returns correct values when there is only a single violation', () => {
        const violation = {name: 'overLimit'};
        const expectedField = 'amount';
        violations = [violation];

        const {result} = callHook();
        expect(result.current.hasViolations(expectedField)).toBe(true);
        expect(result.current.getViolationsForField(expectedField)).toEqual([violation]);
    });

    it('returns all violations for a field when there are many violations on the same field', () => {
        // All of these are violations on 'amount'
        violations = [{name: 'overLimit'}, {name: 'perDayLimit'}, {name: 'modifiedAmount'}, {name: 'overCategoryLimit'}];
        const expectedField = 'amount';
        const {result} = callHook();
        expect(result.current.hasViolations(expectedField)).toBe(true);
        expect(result.current.getViolationsForField(expectedField)).toEqual(violations);
    });

    it(`returns correct values when callbacks are passed non-existing field`, () => {
        const field = 'nonExistingField';
        const {result} = callHook();
        expect(result.current.hasViolations(field)).toBe(false);
        expect(result.current.getViolationsForField(field)).toEqual([]);
    });

    // eslint-disable-next-line rulesdir/prefer-underscore-method -- it.each is not array.each
    it.each(fieldNames)(`returns correct values from callbacks when hook is passed empty violations array (%s)`, (field) => {
        violations = [];
        const {result} = callHook();
        expect(result.current.hasViolations(field)).toBe(false);
        expect(result.current.getViolationsForField(field)).toEqual([]);
    });

    // eslint-disable-next-line rulesdir/prefer-underscore-method -- it.each is not array.each
    it.each(fieldNames)(`returns correct values for non-existing violation name (%s)`, (field) => {
        violations = [{name: 'nonExistingViolation'}];
        const {result} = callHook();
        expect(result.current.hasViolations(field)).toBe(false);
        expect(result.current.getViolationsForField(field)).toEqual([]);
    });

    // eslint-disable-next-line rulesdir/prefer-underscore-method  -- it.each is not array.each
    it.each(fieldNames)(`returns correct violations for %s`, (field) => {
        const {result} = callHook();
        const expectedViolations = violationsByField[field] || [];
        expect(result.current.getViolationsForField(field)).toEqual(expectedViolations);
    });
});
