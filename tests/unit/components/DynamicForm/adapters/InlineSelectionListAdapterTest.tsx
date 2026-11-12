import {render, screen} from '@testing-library/react-native';

import InlineSelectionListAdapter from '@components/DynamicForm/adapters/InlineSelectionListAdapter';
import SelectionList from '@components/SelectionList';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

const items = [
    {value: 'RETAIL', label: 'Retail'},
    {value: 'SERVICES', label: 'Services'},
];

describe('InlineSelectionListAdapter', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    it('adds and removes keys when several options can be picked', () => {
        // Given a multi-select list with Retail picked
        const onInputChange = jest.fn();
        render(
            <InlineSelectionListAdapter
                items={items}
                canSelectMultiple
                value={['RETAIL']}
                onInputChange={onInputChange}
            />,
        );
        const listProps = mockedSelectionList.mock.lastCall?.[0];
        const [retail, services] = listProps?.data ?? [];

        // When the user taps Services, or taps Retail instead
        if (services && retail) {
            listProps?.onSelectRow(services);
            listProps?.onSelectRow(retail);
        }

        // Then tapping Services adds it to the picked keys, and tapping Retail removes it
        expect(onInputChange).toHaveBeenNthCalledWith(1, ['RETAIL', 'SERVICES']);
        expect(onInputChange).toHaveBeenNthCalledWith(2, []);
    });

    it('drops a picked key missing from the list on the next change', () => {
        // Given a multi-select list whose answer still holds an option missing from the list, which has no row the user could deselect
        const onInputChange = jest.fn();
        render(
            <InlineSelectionListAdapter
                items={items}
                canSelectMultiple
                value={['WHOLESALE', 'RETAIL']}
                onInputChange={onInputChange}
            />,
        );
        const services = mockedSelectionList.mock.lastCall?.[0]?.data.find((item) => item.keyForList === 'SERVICES');

        // When the user taps Services
        if (services) {
            mockedSelectionList.mock.lastCall?.[0]?.onSelectRow(services);
        }

        // Then the answer keeps only offered options, so the form can be submitted
        expect(onInputChange).toHaveBeenCalledWith(['RETAIL', 'SERVICES']);
    });

    it('reports the one key picked when a single option can be picked', () => {
        // Given a single-select list
        const onInputChange = jest.fn();
        render(
            <InlineSelectionListAdapter
                items={items}
                onInputChange={onInputChange}
            />,
        );
        const listProps = mockedSelectionList.mock.lastCall?.[0];
        const services = listProps?.data.at(1);

        // When the user taps Services
        if (services) {
            listProps?.onSelectRow(services);
        }

        // Then the answer is that key alone
        expect(onInputChange).toHaveBeenCalledWith('SERVICES');
    });

    it('masks the options in session recordings', () => {
        // Given a list whose picked option must stay out of session recordings
        const forwardedFSClass = CONST.FULLSTORY.CLASS.MASK;

        // When it renders
        render(
            <InlineSelectionListAdapter
                items={items}
                forwardedFSClass={forwardedFSClass}
            />,
        );

        // Then the view around the list carries the mask, since SelectionList takes no FullStory class itself
        expect(screen.toJSON()).toMatchObject({props: {fsClass: forwardedFSClass}});
    });
});
