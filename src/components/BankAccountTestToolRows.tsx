// Rows that add a test bank account to the signed-in user. Shown to anyone on a local server and to internal test accounts on the staging server, never on production.
import useActiveServer from '@hooks/useActiveServer';
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

    const {isProduction} = useEnvironment();
    const {activeServer, isStagingIgnored: isOnLocalServer} = useActiveServer();
    const [email = ''] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const isOnAllowedEmailDomain = Str.extractEmailDomain(email).toLowerCase() === CONST.TEST_BANK_ACCOUNT_STAGING_EMAIL_DOMAIN;
    const isAllowedOnStagingServer = activeServer === CONST.SERVER.STAGING && isOnAllowedEmailDomain;

    // The server only accepts the command from anyone when it is local, and from internal test accounts when it is staging
    if (isProduction || (!isOnLocalServer && !isAllowedOnStagingServer)) {
        return null;
    }

    const addTestBankAccount = (type: ValueOf<typeof CONST.TEST_BANK_ACCOUNT_TYPE>) => {
        const addAndOpenWallet = () => addTestBankAccountAndOpenWallet(type);

        // A personal bank account needs a validated account, and on the staging server so does a business one
        if (!isUserValidated && (type === CONST.TEST_BANK_ACCOUNT_TYPE.PERSONAL || !isOnLocalServer)) {
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
