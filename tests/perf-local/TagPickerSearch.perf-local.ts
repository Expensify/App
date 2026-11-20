/**
 * Measures one keystroke in the tag picker's search box, for workspaces with large independent tag lists. Each
 * scenario renders the real TagPicker with N tags, sets the search text to the value before the keystroke, then times
 * one change of the search text until TagPicker has handed the list its updated sections. The list itself is mocked,
 * so the time is TagPicker's own work (the re-render and building the sections), not the list's rendering.
 *
 * Tags are stored either in random order or already in name order, because the sort costs much less on sorted input.
 *
 * Run with: npm run perf-local -- --testMatch '<rootDir>/tests/perf-local/TagPickerSearch.perf-local.ts'
 * It prints one line per scenario, so it also runs under plain Jest:
 * npx jest --testMatch '<rootDir>/tests/perf-local/TagPickerSearch.perf-local.ts' --runInBand
 */
import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';
import TagPicker from '@components/TagPicker';

import type Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTags} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction} from 'reassure';

import createMock from '../utils/createMock';
import {setupGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'tag-picker-perf-policy';
const TAG_LIST_NAME = 'Project';
const RUNS = 10;
const WARMUP_RUNS = 1;
const TEST_TIMEOUT_MS = 20 * 60 * 1000;

jest.mock('@libs/API');

const mockSelectionList = jest.fn<null, [SelectionListWithSectionsProps<ListItem>]>(() => null);
jest.mock('@components/SelectionList/SelectionListWithSections', () => ({
    __esModule: true,
    default: (props: SelectionListWithSectionsProps<ListItem>) => mockSelectionList(props),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
        useFocusEffect: jest.fn(),
        useNavigation: jest.fn(() => ({
            isFocused: jest.fn(() => true),
            addListener: jest.fn(() => jest.fn()),
        })),
    };
});

setupGlobalFetchMock();

const WORDS = [
    'Project',
    'Phase',
    'Client',
    'North',
    'South',
    'East',
    'West',
    'Marketing',
    'Sales',
    'Operations',
    'Engineering',
    'Finance',
    'Travel',
    'Region',
    'Cost Center',
    'Office',
    'Warehouse',
    'Fleet',
    'Training',
    'Research',
    'Support',
    'Facilities',
    'Grant',
    'Field',
];
const SURNAMES = ['Smith', 'Johnson', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Lopez', 'Wilson', 'Anderson', 'Taylor', 'Moore', 'Jackson', 'Nguyen', 'Perez', 'Walker', 'Young'];

/** A small seeded random number generator (Park-Miller), so every run uses the same tag names. */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 48271) % 2147483647;
        return (state - 1) / 2147483646;
    };
}

/** Unique tag names that look like project, job and cost center codes, in the random order they were made. */
function createTagNames(count: number): string[] {
    const random = createRandom(count);
    const pick = (values: string[]) => values.at(Math.floor(random() * values.length)) ?? '';
    const names = new Set<string>();
    while (names.size < count) {
        const code = 1000 + Math.floor(random() * 900000);
        const style = random();
        if (style < 0.4) {
            names.add(`${code} - ${pick(SURNAMES)} ${pick(WORDS)}`);
        } else if (style < 0.7) {
            names.add(`${pick(WORDS)} ${pick(WORDS)} ${code}`);
        } else if (style < 0.9) {
            names.add(`${pick(SURNAMES)} & ${pick(SURNAMES)} - ${pick(WORDS)} ${code % 1000}`);
        } else {
            names.add(`JOB-${code} ${pick(WORDS)}`);
        }
    }
    return [...names];
}

function createTags(names: string[]): PolicyTags {
    const tags: PolicyTags = {};
    for (const name of names) {
        tags[name] = {name, enabled: true};
    }
    return tags;
}

function getLastListProps() {
    const listProps = mockSelectionList.mock.lastCall?.[0];
    if (!listProps) {
        throw new Error('TagPicker did not render the list');
    }
    return listProps;
}

function getListedRowCount(listProps: SelectionListWithSectionsProps<ListItem>) {
    return listProps.sections.reduce((total, section) => total + section.data.length, 0);
}

function writeResult(label: string, result: {meanDuration: number; stdevDuration: number; durations: number[]; outlierDurations?: number[]}, listedRows: number) {
    // Written to stdout directly so the numbers reach the CI log even when Jest runs with --silent.
    const durations = result.durations.map((duration) => duration.toFixed(1)).join(', ');
    const outliers = (result.outlierDurations ?? []).map((duration) => duration.toFixed(1)).join(', ');
    process.stdout.write(
        `[TagPickerSearchBench] ${label} mean=${result.meanDuration.toFixed(1)}ms stdev=${result.stdevDuration.toFixed(1)}ms runs=${RUNS} durations=[${durations}] outliers=[${outliers}] listedRows=${listedRows}\n`,
    );
}

const TAG_COUNTS = [10_000, 20_000, 50_000];
const ORDERS = ['random', 'sorted'] as const;
const KEYSTROKES = [
    {searchBefore: '', searchAfter: 'p'},
    {searchBefore: 'pr', searchAfter: 'pro'},
];
const SCENARIOS = TAG_COUNTS.flatMap((tagCount) => ORDERS.flatMap((order) => KEYSTROKES.map((keystroke) => ({tagCount, order, ...keystroke}))));

const collator = new Intl.Collator(CONST.LOCALES.EN, {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'});

describe('Tag picker search keystroke', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        mockSelectionList.mockClear();
        await act(async () => {
            await Onyx.clear();
        });
    });

    test.each(SCENARIOS)(
        '$tagCount tags in $order order, typing "$searchAfter"',
        async ({tagCount, order, searchBefore, searchAfter}) => {
            const names = createTagNames(tagCount);
            if (order === 'sorted') {
                names.sort((first, second) => collator.compare(first, second));
            }
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {
                    [TAG_LIST_NAME]: {name: TAG_LIST_NAME, orderWeight: 0, required: false, tags: createTags(names)},
                });
            });

            const {unmount} = render(
                React.createElement(
                    ComposeProviders,
                    createMock<React.ComponentProps<typeof ComposeProviders>>({components: [OnyxListItemProvider, LocaleContextProvider]}),
                    React.createElement(TagPicker, {policyID: POLICY_ID, selectedTag: '', tagListName: TAG_LIST_NAME, tagListIndex: 0, onSubmit: () => {}}),
                ),
            );
            await waitForBatchedUpdatesWithAct();
            // Every tag is listed before any search.
            expect(getListedRowCount(getLastListProps())).toBe(tagCount);

            let listPropsBeforeKeystroke = getLastListProps();
            let completedKeystrokes = 0;
            let listedRows = 0;

            const result = await measureAsyncFunction(
                async () => {
                    await act(async () => {
                        listPropsBeforeKeystroke.textInputOptions?.onChangeText?.(searchAfter);
                    });
                    const listPropsAfterKeystroke = getLastListProps();
                    listedRows = getListedRowCount(listPropsAfterKeystroke);
                    if (listPropsAfterKeystroke.textInputOptions?.value === searchAfter && listedRows > 0 && listedRows < tagCount) {
                        completedKeystrokes++;
                    }
                },
                {
                    runs: RUNS,
                    warmupRuns: WARMUP_RUNS,
                    // The numbers are written to stdout below, so this also runs under plain Jest, which has no .reassure output folder
                    writeFile: false,
                    // Put the search text back to its value before the keystroke, so every measured run makes the same keystroke.
                    beforeEach: async () => {
                        await act(async () => {
                            getLastListProps().textInputOptions?.onChangeText?.(searchBefore);
                        });
                        listPropsBeforeKeystroke = getLastListProps();
                        // Drop the recorded list props, so earlier runs' sections are not kept in memory.
                        mockSelectionList.mockClear();
                    },
                },
            );

            writeResult(`tags=${tagCount} order=${order} keystroke="${searchBefore}"->"${searchAfter}"`, result, listedRows);
            unmount();

            // Every measured run (plus the warmup run) ended with the list filtered to the new search text.
            expect(completedKeystrokes).toBe(RUNS + WARMUP_RUNS);
        },
        TEST_TIMEOUT_MS,
    );
});
