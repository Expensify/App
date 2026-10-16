import {render, screen, within} from '@testing-library/react-native';

import FixedFooter from '@components/FixedFooter';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import NetSuiteImportCustomFieldPage from '@pages/workspace/accounting/netsuite/import/NetSuiteImportCustomFieldPage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {ComponentProps} from 'react';
import type {ValueOf} from 'type-fest';

import React from 'react';

import createMock from '../utils/createMock';

type ImportCustomFieldsKeys = ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

/** The props the page itself takes, before `withPolicyConnections` strips the ones it injects. */
type PageProps = {
    policy: Policy;
    route: {
        params: {
            importCustomField: ImportCustomFieldsKeys;
        };
    };
};

let mockPolicy: Policy;

const SCROLL_VIEW_TEST_ID = 'netsuite-custom-field-scroll-view';
const FIXED_FOOTER_TEST_ID = 'netsuite-custom-field-fixed-footer';
const RECORD_ROW_TEST_ID = 'netsuite-custom-field-record-row';
const EMPTY_STATE_TEST_ID = 'netsuite-custom-field-empty-state';

jest.mock('@components/ScreenWrapper', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return jest.fn(({children}: {children?: React.ReactNode}) => <RN.View>{children}</RN.View>);
});

jest.mock('@components/ScrollView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return jest.fn(({children}: {children?: React.ReactNode}) => <RN.View testID="netsuite-custom-field-scroll-view">{children}</RN.View>);
});

jest.mock('@components/FixedFooter', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return jest.fn(({children}: {children?: React.ReactNode}) => <RN.View testID="netsuite-custom-field-fixed-footer">{children}</RN.View>);
});

jest.mock('@components/MenuItem/presets/MenuItemField', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({value}: {value?: string}) => <RN.Text testID="netsuite-custom-field-record-row">{value}</RN.Text>;
});

jest.mock('@components/WorkspaceEmptyStateSection', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({title}: {title?: string}) => <RN.Text testID="netsuite-custom-field-empty-state">{title}</RN.Text>;
});

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/TextLink', () => jest.fn(({children}: {children?: React.ReactNode}) => children));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
// Stand in for the real HOC, which reads the policy from Onyx and injects it into the page.
jest.mock('@pages/workspace/withPolicyConnections', () => (WrappedComponent: React.ComponentType<PageProps>) => (props: Omit<PageProps, 'policy'>) => (
    <WrappedComponent
        {...props}
        policy={mockPolicy}
    />
));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({FolderWithPapers: () => null})),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

function buildRecord(importCustomField: ImportCustomFieldsKeys, index: number) {
    const name = `Record ${index + 1}`;
    return importCustomField === CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS ? {internalID: `${index}`, segmentName: name} : {internalID: `${index}`, listName: name};
}

function buildPolicy(importCustomField: ImportCustomFieldsKeys, recordCount: number) {
    return createMock<Policy>({
        id: 'P1',
        connections: {
            netsuite: {
                options: {
                    config: {
                        syncOptions: {
                            [importCustomField]: Array.from({length: recordCount}, (_, index) => buildRecord(importCustomField, index)),
                        },
                    },
                },
            },
        },
    });
}

function renderPage(importCustomField: ImportCustomFieldsKeys, recordCount: number) {
    mockPolicy = buildPolicy(importCustomField, recordCount);
    const props = createMock<ComponentProps<typeof NetSuiteImportCustomFieldPage>>({route: {params: {importCustomField}}});
    return render(<NetSuiteImportCustomFieldPage {...props} />);
}

describe.each([CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS, CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS])(
    'NetSuiteImportCustomFieldPage (%s)',
    (importCustomField) => {
        const mockedScreenWrapper = jest.mocked(ScreenWrapper);
        const mockedScrollView = jest.mocked(ScrollView);
        const mockedFixedFooter = jest.mocked(FixedFooter);

        beforeEach(() => {
            mockedScreenWrapper.mockClear();
            mockedScrollView.mockClear();
            mockedFixedFooter.mockClear();
        });

        it('keeps the default top safe-area padding so the header is not drawn under the status bar', () => {
            renderPage(importCustomField, 3);

            // `includePaddingTop` defaults to true, so `ScreenWrapper` applies the top safe-area inset and the header renders below the status bar.
            expect(mockedScreenWrapper.mock.lastCall?.[0].includePaddingTop).not.toBe(false);
        });

        it('renders exactly one scroll area so the record list is never height-pinned to the viewport', () => {
            renderPage(importCustomField, 3);

            // `ConnectionLayout` must keep its own ScrollView off (`shouldUseScrollView={false}`), otherwise the page's
            // `contentContainerStyle={[styles.flex1]}` lands on that ScrollView's content container, pins its height to the
            // viewport and scrolling can never engage. Only the page's own inner ScrollView may render.
            expect(screen.queryAllByTestId(SCROLL_VIEW_TEST_ID).length).toBe(1);
            expect(mockedScrollView).toHaveBeenCalledTimes(1);
            // The surviving ScrollView is the page's own, which never receives a content container style.
            expect(mockedScrollView.mock.lastCall?.[0].contentContainerStyle).toBeUndefined();
        });

        it('renders the record rows inside the scroll area', () => {
            renderPage(importCustomField, 3);

            const rows = within(screen.getByTestId(SCROLL_VIEW_TEST_ID)).queryAllByTestId(RECORD_ROW_TEST_ID);
            expect(rows.length).toBe(3);
            expect(rows.at(0)).toHaveTextContent('Record 1');
        });

        it('keeps the add button footer outside the scroll area so it stays docked when the list overflows', () => {
            renderPage(importCustomField, 20);

            // The footer is a sibling of the scroll area, not a child of it, so a record list taller than the viewport
            // scrolls underneath while the add button stays docked and visible.
            expect(within(screen.getByTestId(SCROLL_VIEW_TEST_ID)).queryAllByTestId(FIXED_FOOTER_TEST_ID).length).toBe(0);
            expect(screen.getByTestId(FIXED_FOOTER_TEST_ID)).toHaveTextContent(`workspace.netsuite.import.importCustomFields.${importCustomField}.addText`);
        });

        it('adds the bottom safe-area padding to both the scroll area and the footer', () => {
            renderPage(importCustomField, 3);

            // The scroll area and the footer are siblings, so neither one inherits a bottom inset from the other and
            // each has to request its own.
            expect(mockedScrollView.mock.lastCall?.[0].addBottomSafeAreaPadding).toBe(true);
            expect(mockedFixedFooter.mock.lastCall?.[0].addBottomSafeAreaPadding).toBe(true);
        });

        it('renders the empty state outside the scroll area with the footer still docked', () => {
            renderPage(importCustomField, 0);

            // With no records the page renders no scroll area at all, so the empty state can keep centering itself in the
            // flex:1 container while the add button stays reachable.
            expect(screen.queryAllByTestId(SCROLL_VIEW_TEST_ID).length).toBe(0);
            expect(screen.getByTestId(EMPTY_STATE_TEST_ID)).toBeOnTheScreen();
            expect(screen.getByTestId(FIXED_FOOTER_TEST_ID)).toBeOnTheScreen();
        });
    },
);
