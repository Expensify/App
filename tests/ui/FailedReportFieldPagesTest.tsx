import {render} from '@testing-library/react-native';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import FieldsAddListValuePage from '@pages/workspace/fields/FieldsAddListValuePage';
import FieldsInitialValuePage from '@pages/workspace/fields/FieldsInitialValuePage';
import FieldsListValuesPage from '@pages/workspace/fields/FieldsListValuesPage';
import FieldsSettingsPage from '@pages/workspace/fields/FieldsSettingsPage';
import FieldsValueSettingsPage from '@pages/workspace/fields/FieldsValueSettingsPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {TupleToUnion} from 'type-fest';

import React from 'react';

import createRandomPolicy from '../utils/collections/policies';

jest.mock('@pages/ErrorPage/NotFoundPage', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true, withReadOnlyFallback: () => undefined}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useOnyx', () => () => [{listValues: ['Value'], disabledListValues: [false]}]);
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));
jest.mock('@hooks/useMobileSelectionMode', () => () => false);
jest.mock('@hooks/useFilteredSelection', () => () => [[], jest.fn()]);
jest.mock('@hooks/useCleanupSelectedOptions', () => jest.fn());
jest.mock('@hooks/useSearchBackPress', () => jest.fn());
jest.mock('@hooks/useShouldDisplayButtonsInSeparateLine', () => () => false);
jest.mock('@hooks/useLayoutSpacing', () => () => ({}));

const getRoute = () => ROUTES.HOME;
const pages = ['settings', 'initial value', 'list values', 'add list value', 'value settings'] as const;
type Page = TupleToUnion<typeof pages>;

function renderPage(page: Page, target: 'expense' | 'invoice', pendingAction?: PendingAction, hasErrors = false, isDraft = false) {
    const fieldKey = 'expensify_test';
    const errorKey = '1';
    const policy: Policy = {
        ...createRandomPolicy(0),
        fieldList: {
            [fieldKey]: {
                name: 'Test field',
                fieldID: 'test',
                type: CONST.REPORT_FIELD_TYPES.LIST,
                target,
                defaultValue: '',
                values: ['Value'],
                disabledOptions: [false],
                orderWeight: 1,
                deletable: true,
                keys: [],
                externalIDs: [],
                isTax: false,
                ...(pendingAction ? {pendingAction} : {}),
                ...(hasErrors ? {errors: {[errorKey]: 'Creation failed'}} : {}),
            },
        },
    };
    const props = {
        policy,
        policyID: policy.id,
        reportFieldID: isDraft ? undefined : 'test',
        featureName: CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED,
        policyFeature: CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS,
        expectedTarget: target,
        isInvoicePage: target === CONST.REPORT_FIELD_TARGETS.INVOICE,
        testID: 'field-editor',
    };
    switch (page) {
        case 'settings':
            return render(
                <FieldsSettingsPage
                    {...props}
                    reportFieldID="test"
                    getListValuesRoute={getRoute}
                    getInitialValueRoute={getRoute}
                />,
            );
        case 'initial value':
            return render(
                <FieldsInitialValuePage
                    {...props}
                    reportFieldID="test"
                />,
            );
        case 'list values':
            return render(
                <FieldsListValuesPage
                    {...props}
                    getValueSettingsRoute={getRoute}
                    getAddValueRoute={getRoute}
                />,
            );
        case 'add list value':
            return render(<FieldsAddListValuePage {...props} />);
        case 'value settings':
            return render(
                <FieldsValueSettingsPage
                    {...props}
                    valueIndex={0}
                    getEditValueRoute={getRoute}
                />,
            );
        default:
            throw new Error('Unsupported field editor');
    }
}

describe.each(['expense', 'invoice'] as const)('failed %s field deep links', (target) => {
    beforeEach(() => jest.clearAllMocks());

    it.each(pages)('blocks the %s editor for a failed add', (page) => {
        // Given a failed field that is still present in the workspace
        // When its editor is opened directly instead of through the field list
        renderPage(page, target, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, true);

        // Then only NotFound renders, leaving no API-backed editing controls
        expect(NotFoundPage).toHaveBeenCalled();
        expect(AccessOrNotFoundWrapper).not.toHaveBeenCalled();
    });

    it.each(pages)('keeps the %s editor available for an error-free offline add', (page) => {
        // Given an offline field whose creation has not failed
        // When its editor is opened
        renderPage(page, target, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

        // Then pending creation alone does not block access
        expect(NotFoundPage).not.toHaveBeenCalled();
        expect(AccessOrNotFoundWrapper).toHaveBeenCalled();
    });

    it.each(pages)('keeps the %s editor available for an existing field with an error', (page) => {
        // Given an existing field whose update failed
        // When its editor is opened to correct the value
        renderPage(page, target, undefined, true);

        // Then the update error does not turn the existing field into NotFound
        expect(NotFoundPage).not.toHaveBeenCalled();
        expect(AccessOrNotFoundWrapper).toHaveBeenCalled();
    });

    it.each<Page>(['list values', 'add list value', 'value settings'])('keeps draft %s creation available without a field ID', (page) => {
        // Given a new field draft that has not been submitted
        // When its list-value editor opens without a field ID
        renderPage(page, target, undefined, false, true);

        // Then absence of a saved field does not block the draft flow
        expect(NotFoundPage).not.toHaveBeenCalled();
        expect(AccessOrNotFoundWrapper).toHaveBeenCalled();
    });
});
