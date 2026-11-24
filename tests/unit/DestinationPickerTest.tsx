import {render} from '@testing-library/react-native';

import DestinationPicker from '@components/DestinationPicker';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import {getPerDiemCustomUnit} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {CustomUnit} from '@src/types/onyx/Policy';

import React from 'react';

jest.mock('@hooks/usePolicy', () => () => undefined);
jest.mock('@hooks/useOnyx', () => () => [['deleted']]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useDebouncedState', () => () => ['', '', jest.fn()]);
jest.mock('@libs/PolicyUtils', () => ({getPerDiemCustomUnit: jest.fn()}));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => () => null);

describe('DestinationPicker pending deletions', () => {
    it('does not reintroduce a pending-deleted destination through selected or recent options', () => {
        // Given the previously selected and recently used destination has been deleted offline
        const customUnit: CustomUnit = {
            customUnitID: 'per-diem',
            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
            rates: {
                deleted: {customUnitRateID: 'deleted', name: 'London', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                available: {customUnitRateID: 'available', name: 'Paris'},
            },
        };
        jest.mocked(getPerDiemCustomUnit).mockReturnValue(customUnit);

        // When the real destination picker builds its selection list
        render(
            <DestinationPicker
                policyID="policy"
                selectedDestination="deleted"
                onSubmit={jest.fn()}
            />,
        );
        const props = jest.mocked(SelectionListWithSections).mock.calls.at(-1)?.[0];

        // Then the deleted destination is absent even from the selected section
        expect(props?.sections.flatMap(({data}) => data.map(({keyForList}) => keyForList))).toEqual(['available']);
        expect(props?.initiallyFocusedItemKey).toBeUndefined();
        expect(customUnit.rates?.deleted).toBeDefined();
    });
});
