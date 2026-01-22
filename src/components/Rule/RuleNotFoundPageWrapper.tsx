/* eslint-disable rulesdir/no-negated-variables */
import React from 'react';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import {getKeyForRule} from '@libs/ExpenseRuleUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ExpenseRule} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type RuleNotFoundPageWrapperProps = {
    children: React.ReactNode;
    hash?: string;
    shouldPreventShow?: boolean;
};

function RuleNotFoundPageWrapper({children, hash, shouldPreventShow}: RuleNotFoundPageWrapperProps) {
    const [expenseRules = getEmptyArray<ExpenseRule>(), rulesMetadata] = useOnyx(ONYXKEYS.NVP_EXPENSE_RULES, {canBeMissing: true});
    const doesRuleExist = !!hash && expenseRules.some((rule) => getKeyForRule(rule) === hash);

    const shouldShowFullScreenLoadingIndicator = isLoadingOnyxValue(rulesMetadata);
    const shouldShowNotFoundPage = !!hash && !doesRuleExist;

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (!shouldPreventShow && shouldShowNotFoundPage) {
        return (
            <NotFoundPage
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SETTINGS_RULES);
                }}
                shouldShowBackButton
                shouldShowOfflineIndicator={false}
            />
        );
    }

    return children;
}

export default RuleNotFoundPageWrapper;
