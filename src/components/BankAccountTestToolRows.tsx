// Rows that add test bank accounts to the signed-in user: for anyone on dev, and only for expensifail.com accounts on staging, which is the server's rule too.
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useVerifyAccountAndResume from '@hooks/useVerifyAccountAndResume';

import {createTestBankAccount} from '@libs/actions/BankAccounts';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import {emailSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import React from 'react';

import Button from './Button';
import ButtonDisabledWhenOffline from './Button/composed/ButtonDisabledWhenOffline';
import TestToolRow from './TestToolRow';

function addTestBankAccountAndOpenWallet(type: ValueOf<typeof CONST.TEST_BANK_ACCOUNT_TYPE>) {
    createTestBankAccount(type);
    if (Navigation.getActiveRoute().includes(ROUTES.TEST_TOOLS_MODAL.route)) {
        Navigation.dismissModal();
    }
    Navigation.navigate(ROUTES.SETTINGS_WALLET);
}

function BankAccountTestToolRows() {
    const {translate} = useLocalize();
    const {isUserValidated, verifyAccountAndResume} = useVerifyAccountAndResume((addTestBankAccount?: () => void) => addTestBankAccount?.());

    const {isDevelopment, isProduction} = useEnvironment();
    const [email = ''] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const isExpensifailAccount = Str.extractEmailDomain(email).toLowerCase() === CONST.TEST_BANK_ACCOUNT_STAGING_EMAIL_DOMAIN;

    if (isProduction || (!isDevelopment && !isExpensifailAccount)) {
        return null;
    }

    const addTestBankAccount = (type: ValueOf<typeof CONST.TEST_BANK_ACCOUNT_TYPE>) => {
        const addAndOpenWallet = () => addTestBankAccountAndOpenWallet(type);

        // The server refuses an account that is not validated for a personal bank account, and for either type outside dev
        if (!isUserValidated && (type === CONST.TEST_BANK_ACCOUNT_TYPE.PERSONAL || !isDevelopment)) {
            verifyAccountAndResume(addAndOpenWallet);
            return;
        }
        addAndOpenWallet();
    };

    return (
        <>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.testBusinessBankAccount')}>
                <ButtonDisabledWhenOffline
                    sentryLabel={CONST.SENTRY_LABEL.TEST_TOOL_MENU.ADD_TEST_BUSINESS_BANK_ACCOUNT}
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => addTestBankAccount(CONST.TEST_BANK_ACCOUNT_TYPE.BUSINESS)}
                >
                    <Button.Text>{translate('common.add')}</Button.Text>
                </ButtonDisabledWhenOffline>
            </TestToolRow>
            <TestToolRow title={translate('initialSettingsPage.troubleshoot.testPersonalBankAccount')}>
                <ButtonDisabledWhenOffline
                    sentryLabel={CONST.SENTRY_LABEL.TEST_TOOL_MENU.ADD_TEST_PERSONAL_BANK_ACCOUNT}
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => addTestBankAccount(CONST.TEST_BANK_ACCOUNT_TYPE.PERSONAL)}
                >
                    <Button.Text>{translate('common.add')}</Button.Text>
                </ButtonDisabledWhenOffline>
            </TestToolRow>
        </>
    );
}

export default BankAccountTestToolRows;
