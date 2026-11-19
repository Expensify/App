import {render} from '@testing-library/react-native';

import ExportedToSelector from '@components/Search/FilterComponents/ExportedToSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React from 'react';

const mockOnChange = jest.fn();
const mockMultiSelect = jest.fn<
    ReactNode,
    [{items: Array<{text: string; value: string; leftElement?: ReactNode}>; value: Array<{text: string; value: string}>; onChange: (items: Array<{text: string; value: string}>) => void}]
>(() => null);

const mockPolicies = {
    [`${ONYXKEYS.COLLECTION.POLICY}1`]: {id: '1', connections: {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {lastSync: {isConnected: true}}}},
};

jest.mock('@components/Search/FilterComponents/MultiSelect', () => (props: Parameters<typeof mockMultiSelect>[0]) => mockMultiSelect(props));
jest.mock('@components/Icon', () => () => null);
jest.mock('@hooks/useCombinedExportTemplates', () => () => [{templateName: 'custom-netsuite', name: 'NetSuite', type: 'integrations'}]);
jest.mock('@hooks/useOnyx', () => () => [mockPolicies]);
jest.mock('@hooks/useLocalize', () => () => ({localeCompare: (left: string, right: string) => left.localeCompare(right)}));
jest.mock('@hooks/useTheme', () => () => ({icon: '#000000'}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useStyleUtils', () => () => ({getWidthAndHeightStyle: () => ({}), getAvatarBorderStyle: () => ({})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({NetSuiteSquare: () => null, Table: () => null, TablePencil: () => null})}));

describe('ExportedToSelector', () => {
    it('keeps names unchanged while selecting integration and template values separately', () => {
        render(
            <ExportedToSelector
                value={['template:NetSuite']}
                policyID={undefined}
                onChange={mockOnChange}
            />,
        );
        const props = mockMultiSelect.mock.calls.at(-1)?.[0];

        expect(props?.items.map(({text, value}) => ({text, value}))).toEqual([
            {text: 'NetSuite', value: 'NetSuite'},
            {text: 'NetSuite', value: 'template:NetSuite'},
        ]);
        expect(props?.items.every(({leftElement}) => leftElement !== undefined)).toBe(true);
        expect(props?.value.map(({value}) => value)).toEqual(['template:NetSuite']);
        props?.onChange(props.items);
        expect(mockOnChange).toHaveBeenCalledWith(['NetSuite', 'template:NetSuite']);
    });
});
