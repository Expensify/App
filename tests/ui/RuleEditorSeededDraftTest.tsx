import {act, render, screen} from '@testing-library/react-native';

import usePolicy from '@hooks/usePolicy';
import usePolicyData from '@hooks/usePolicyData';
import type PolicyData from '@hooks/usePolicyData/types';

import FlagForReviewRulePageBase from '@pages/workspace/rules/FlagForReviewRules/FlagForReviewRulePageBase';
import RequireFieldsRulePageBase from '@pages/workspace/rules/RequireFieldsRules/RequireFieldsRulePageBase';
import SpendRulePageBase from '@pages/workspace/rules/SpendRules/SpendRulePageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
    })),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: (_target, iconName) => iconName,
                },
            ),
    ),
}));
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/usePolicyData', () => jest.fn());
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => jest.fn(() => ({canWrite: true, showReadOnlyModal: jest.fn()})));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false})));
jest.mock('@hooks/useCategoryRuleCreateBackPath', () => jest.fn(() => undefined));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: (amount: number) => String(amount), getCurrencyDecimals: () => 2}),
}));
jest.mock('@hooks/useCanWriteCardSpendRules', () => jest.fn(() => true));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
jest.mock('@hooks/useControlOnlyRuleUpgradeRedirect', () => jest.fn());
jest.mock('@hooks/useDefaultFundID', () => jest.fn(() => 1));
jest.mock('@hooks/usePressLoading', () => jest.fn(() => ({isLoading: false, startWithLoading: jest.fn()})));
jest.mock('@pages/workspace/rules/useRuleDeleteHeaderProps', () => jest.fn(() => ({deleteIconButtonProps: undefined})));
jest.mock('@pages/workspace/rules/DescribeRuleModal', () => () => null);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => () => null);
jest.mock('@components/FormAlertWithSubmitButton', () => () => null);
jest.mock('@components/Text', () => () => null);
jest.mock('@components/MenuItemWithTopDescription', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({description, title}: {description?: string; title?: string}) => ReactModule.createElement(Text, null, `${description}: ${title ?? ''}`);
});
jest.mock('@components/RequireFieldsRules/FieldRequirementSettingRow', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({fieldKey, touchedFields}: {fieldKey: string; touchedFields: Set<string>}) =>
        ReactModule.createElement(Text, null, `${fieldKey}: ${touchedFields.has(fieldKey) ? 'touched' : 'untouched'}`);
});
jest.mock('@components/SpendRules/SpendRuleRestrictionTypeToggleRevamp', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({restrictionAction}: {restrictionAction: string | null}) => ReactModule.createElement(Text, null, `restriction: ${restrictionAction ?? 'off'}`);
});

const POLICY_ID = 'policy1';
const TEST_ID = 'RuleEditorSeededDraftTest';

const mockedUsePolicy = jest.mocked(usePolicy);
const mockedUsePolicyData = jest.mocked(usePolicyData);

async function seedDraft(
    key: typeof ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM | typeof ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM | typeof ONYXKEYS.FORMS.SPEND_RULE_FORM,
    draft: Record<string, unknown>,
) {
    await act(async () => {
        await Onyx.set(key, draft);
    });
}

describe('Rule editors opened with a draft from the describe flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const policy = {...createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE), id: POLICY_ID, role: CONST.POLICY.ROLE.ADMIN, areCategoriesEnabled: false};
        mockedUsePolicy.mockReturnValue(policy);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only policy data. The editors read only the policy and its categories.
        mockedUsePolicyData.mockReturnValue({policy, categories: {}, tags: {}, reports: []} as unknown as PolicyData);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('keeps the seeded flag for review draft when the editor opens for a new rule', async () => {
        // Given the describe flow seeded a flag for review draft
        const draft = {category: 'Meals', maxExpenseAmount: '50'};
        await seedDraft(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM, draft);

        // When the editor opens for a new rule
        render(
            <FlagForReviewRulePageBase
                policyID={POLICY_ID}
                testID={TEST_ID}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the editor shows the seeded values, because it must not reset a draft that already exists
        expect(await getOnyxValue(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM)).toEqual(draft);
        expect(screen.getByLabelText('common.category, Meals')).toBeOnTheScreen();
    });

    it('keeps the seeded require fields draft and marks its settings as touched when the editor opens for a new rule', async () => {
        // Given the describe flow seeded a require fields draft
        const draft = {category: 'Meals', receiptSetting: CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE};
        await seedDraft(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM, draft);

        // When the editor opens for a new rule
        render(
            <RequireFieldsRulePageBase
                policyID={POLICY_ID}
                testID={TEST_ID}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the draft survives and only the seeded setting counts as touched, the same as when Concierge fills in the open editor
        expect(await getOnyxValue(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM)).toEqual(draft);
        expect(screen.getByText('receiptSetting: touched')).toBeOnTheScreen();
        expect(screen.getByText('descriptionSetting: untouched')).toBeOnTheScreen();
    });

    it('keeps merchant restrictions on when the seeded spend rule draft has merchants', async () => {
        // Given the describe flow seeded a spend rule draft that blocks a merchant
        const draft = {merchantNames: ['Walmart'], restrictionAction: CONST.SPEND_RULES.ACTION.BLOCK};
        await seedDraft(ONYXKEYS.FORMS.SPEND_RULE_FORM, draft);

        // When the editor opens for a new rule
        render(
            <SpendRulePageBase
                policyID={POLICY_ID}
                testID={TEST_ID}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the merchant restriction shows, because the editor reads the toggle from the seeded draft
        expect(await getOnyxValue(ONYXKEYS.FORMS.SPEND_RULE_FORM)).toEqual(draft);
        expect(screen.getByText(`restriction: ${CONST.SPEND_RULES.ACTION.BLOCK}`)).toBeOnTheScreen();
        expect(screen.getByText(/workspace\.rules\.spendRules\.blockedMerchants/)).toBeOnTheScreen();
    });

    it('opens a new spend rule with merchant restrictions off when there is no draft', async () => {
        // Given no draft, because the admin picked the spend rule type without describing a rule

        // When the editor opens for a new rule
        render(
            <SpendRulePageBase
                policyID={POLICY_ID}
                testID={TEST_ID}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then merchant restrictions start off, as they do for any new spend rule
        expect(screen.getByText('restriction: off')).toBeOnTheScreen();
        expect(screen.queryByText(/workspace\.rules\.spendRules\.blockedMerchants/)).toBeNull();
    });
});
