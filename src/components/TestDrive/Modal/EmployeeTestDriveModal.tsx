import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import TestReceipt from '@assets/images/fake-test-drive-employee-receipt.jpg';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import {
    initMoneyRequest,
    setMoneyRequestAmount,
    setMoneyRequestCreated,
    setMoneyRequestDescription,
    setMoneyRequestMerchant,
    setMoneyRequestParticipants,
    setMoneyRequestReceipt,
} from '@libs/actions/IOU';
import {verifyTestDriveRecipient} from '@libs/actions/Onboarding';
import setTestReceipt from '@libs/actions/setTestReceipt';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import BaseTestDriveModal from './BaseTestDriveModal';

function EmployeeTestDriveModal() {
    const {translate} = useLocalize();
    const [bossEmail, setBossEmail] = useState('');
    const [formError, setFormError] = useState<string | undefined>();

    const isValidBossEmail = useMemo((): boolean => {
        const loginTrim = bossEmail.trim();

        return !!loginTrim && Str.isValidEmail(loginTrim);
    }, [bossEmail]);

    const onBossEmailChange = useCallback((value: string) => {
        setBossEmail(value);
        setFormError(undefined);
    }, []);

    const navigate = () => {
        if (!isValidBossEmail) {
            setFormError(translate('common.error.email'));
            return;
        }

        verifyTestDriveRecipient(bossEmail)
            .then(() => {
                setTestReceipt(TestReceipt, 'jpg', (source, _, filename) => {
                    const transactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
                    const reportID = generateReportID();
                    initMoneyRequest(reportID, undefined, false, CONST.IOU.REQUEST_TYPE.SCAN, CONST.IOU.REQUEST_TYPE.SCAN);

                    setMoneyRequestReceipt(transactionID, source, filename, true, CONST.TEST_RECEIPT.FILE_TYPE, false, true);

                    setMoneyRequestParticipants(transactionID, [
                        {
                            accountID: generateAccountID(bossEmail),
                            login: bossEmail,
                            displayName: bossEmail,
                            selected: true,
                        },
                    ]);

                    setMoneyRequestAmount(transactionID, CONST.TEST_DRIVE.EMPLOYEE_FAKE_RECEIPT.AMOUNT, CONST.TEST_DRIVE.EMPLOYEE_FAKE_RECEIPT.CURRENCY);
                    setMoneyRequestDescription(transactionID, CONST.TEST_DRIVE.EMPLOYEE_FAKE_RECEIPT.DESCRIPTION, true);
                    setMoneyRequestMerchant(transactionID, CONST.TEST_DRIVE.EMPLOYEE_FAKE_RECEIPT.MERCHANT, true);
                    setMoneyRequestCreated(transactionID, CONST.TEST_DRIVE.EMPLOYEE_FAKE_RECEIPT.CREATED, true);

                    InteractionManager.runAfterInteractions(() => {
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                    });
                });
            })
            .catch((error: Error) => {
                setFormError(error.message);
            });
    };

    return (
        <BaseTestDriveModal
            description={translate('testDrive.modal.employee.description')}
            onConfirm={navigate}
            shouldCloseOnConfirm={isValidBossEmail}
            shouldRenderHTMLDescription
            avoidKeyboard
        >
            <TextInput
                placeholder={translate('testDrive.modal.employee.email')}
                accessibilityLabel={translate('testDrive.modal.employee.email')}
                value={bossEmail}
                onChangeText={onBossEmailChange}
                autoCapitalize="none"
                errorText={formError}
                inputMode={CONST.INPUT_MODE.EMAIL}
            />
        </BaseTestDriveModal>
    );
}

EmployeeTestDriveModal.displayName = 'EmployeeTestDriveModal';

export default EmployeeTestDriveModal;
