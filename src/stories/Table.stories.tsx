import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import {View} from 'react-native';
import Table from '@components/Table';
import type {TableColumn} from '@components/Table';
import Text from '@components/Text';

type TableStory = StoryFn<typeof Table>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Table> = {
    title: 'Layout/Table',
    component: Table,
};

type SampleRow = {
    id: string;
    name: string;
    category: string;
    amount: string;
};

type SampleColumnKey = 'name' | 'category' | 'amount';

const sampleData: SampleRow[] = [
    {id: '1', name: 'Office supplies', category: 'Supplies', amount: '$12.50'},
    {id: '2', name: 'Team lunch', category: 'Meals', amount: '$85.00'},
    {id: '3', name: 'Software license', category: 'Software', amount: '$299.00'},
];

const columns: Array<TableColumn<SampleColumnKey>> = [
    {key: 'name', label: 'Name'},
    {key: 'category', label: 'Category'},
    {key: 'amount', label: 'Amount'},
];

function renderItem({item}: ListRenderItemInfo<SampleRow>) {
    return (
        <View style={{flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, gap: 8}}>
            <Text style={{flex: 1}}>{item.name}</Text>
            <Text style={{flex: 1}}>{item.category}</Text>
            <Text style={{flex: 1}}>{item.amount}</Text>
        </View>
    );
}

function DefaultTemplate() {
    return (
        <View style={{height: 300}}>
            <Table
                data={sampleData}
                columns={columns}
                renderItem={renderItem}
                keyExtractor={(row) => row.id}
            >
                <Table.Header />
                <Table.Body />
            </Table>
        </View>
    );
}

function WithSearchTemplate() {
    return (
        <View style={{height: 350}}>
            <Table
                data={sampleData}
                columns={columns}
                renderItem={renderItem}
                keyExtractor={(row) => row.id}
                isItemInSearch={(item, searchString) => item.name.toLowerCase().includes(searchString.toLowerCase())}
                title="Expenses"
            >
                <Table.SearchBar label="Search expenses" />
                <Table.Header />
                <Table.Body />
            </Table>
        </View>
    );
}

const Default: TableStory = DefaultTemplate.bind({});
const WithSearch: TableStory = WithSearchTemplate.bind({});

export default story;
export {Default, WithSearch};
