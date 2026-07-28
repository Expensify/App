import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {removePolicyCategoryReceiptsRequired, setPolicyCategoryReceiptsAndItemizedReceiptRequired, setPolicyCategoryReceiptsRequired} from '@userActions/Policy/Category';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

type DynamicCategoryRequireReceiptsOverPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_RECEIPTS_OVER>;

function getInitiallyFocusedOptionKey(isAlwaysSelected: boolean, isNeverSelected: boolean, isPolicyDisabled: boolean): ValueOf<typeof CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS> {
    if (isAlwaysSelected) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS;
    }

    if (isNeverSelected || isPolicyDisabled) {
        return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER;
    }

    return CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT;
}

function DynamicCategoryRequireReceiptsOverPage({
    route: {
        params: {policyID, categoryName},
    },
}: DynamicCategoryRequireReceiptsOverPageProps) {
    const styles = useThemeStyles();
    const categorySettingsBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_REQUIRE_RECEIPTS_OVER.path);
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const policyData = usePolicyData(policyID);
    const {policy, categories: policyCategories} = policyData;
    const isAlwaysSelected = policyCategories?.[categoryName]?.maxAmountNoReceipt === 0;
    const isNeverSelected = policyCategories?.[categoryName]?.maxAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;
    const isPolicyReceiptDisabled = policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || policy?.maxExpenseAmountNoReceipt === undefined;

    const persistedOptionKey = getInitiallyFocusedOptionKey(isAlwaysSelected, isNeverSelected, isPolicyReceiptDisabled);

    const [draftOptionKey, setDraftOptionKey] = useState<ValueOf<typeof CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS>>();
    const selectedOptionKey = draftOptionKey ?? persistedOptionKey;

    const requireReceiptsOverListData = [
        ...(!isPolicyReceiptDisabled
            ? [
                  {
                      value: null,
                      text: translate(
                          `workspace.rules.categoryRules.requireReceiptsOverList.default`,
                          convertToDisplayString(policy.maxExpenseAmountNoReceipt, policy?.outputCurrency ?? CONST.CURRENCY.USD),
                      ),
                      keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT,
                      isSelected: selectedOptionKey === CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT,
                  },
              ]
            : []),
        {
            value: CONST.DISABLED_MAX_EXPENSE_VALUE,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.never`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER,
            isSelected: selectedOptionKey === CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER,
        },
        {
            value: 0,
            text: translate(`workspace.rules.categoryRules.requireReceiptsOverList.always`),
            keyForList: CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS,
            isSelected: selectedOptionKey === CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.ALWAYS,
        },
    ];

    const saveAndGoBack = () => {
        if (selectedOptionKey === CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.DEFAULT) {
            removePolicyCategoryReceiptsRequired(policyData, categoryName);
        } else if (selectedOptionKey === CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS.NEVER) {
            if (policyCategories?.[categoryName]?.maxAmountNoItemizedReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE) {
                setPolicyCategoryReceiptsAndItemizedReceiptRequired(policyData, categoryName, CONST.DISABLED_MAX_EXPENSE_VALUE, CONST.DISABLED_MAX_EXPENSE_VALUE);
            } else {
                setPolicyCategoryReceiptsRequired(policyData, categoryName, CONST.DISABLED_MAX_EXPENSE_VALUE);
            }
        } else {
            setPolicyCategoryReceiptsRequired(policyData, categoryName, 0);
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack(categorySettingsBackPath));
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
        isDisabled: selectedOptionKey === persistedOptionKey,
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="DynamicCategoryRequireReceiptsOverPage"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.categoryRules.requireReceiptsOver')}
                    onBackButtonPress={() => Navigation.goBack(categorySettingsBackPath)}
                />
                <SelectionList
                    data={requireReceiptsOverListData}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(item) => {
                        setDraftOptionKey(item.keyForList as ValueOf<typeof CONST.POLICY.REQUIRE_RECEIPTS_OVER_OPTIONS>);
                    }}
                    confirmButtonOptions={confirmButtonOptions}
                    style={{containerStyle: styles.pt3}}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={persistedOptionKey}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCategoryRequireReceiptsOverPage;
