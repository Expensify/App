import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';

import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';

import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';

import {useEffect} from 'react';

function ExpenseReportSearchHandler() {
    const {openSearchRouter} = useSearchRouterActions();
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.EXPENSE_REPORT_SEARCH;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                callFunctionIfActionIsAllowed(() => {
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                        return;
                    }
                    openSearchRouter('type:expense-report report-id:');
                })();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
        );

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowRequire2FAPage]);

    return null;
}

export default ExpenseReportSearchHandler;
