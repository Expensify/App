import {useRoute} from '@react-navigation/native';
import {format} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useState} from 'react';
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
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TestDriveModalNavigatorParamList} from '@libs/Navigation/types';
import {generateReportID} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseTestDriveModal from './BaseTestDriveModal';

function EmployeeTestDriveModal() {
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TestDriveModalNavigatorParamList, typeof SCREENS.TEST_DRIVE_MODAL.ROOT>>();
    const [bossEmail, setBossEmail] = useState(route.params?.bossEmail ?? '');
    const [formError, setFormError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const onBossEmailChange = useCallback((value: string) => {
        setBossEmail(value);
        setFormError(undefined);
    }, []);

    const navigate = () => {
        const loginTrim = bossEmail.trim();
        if (!loginTrim || !Str.isValidEmail(loginTrim)) {
            setFormError(translate('common.error.email'));
            return;
        }

        setIsLoading(true);

        verifyTestDriveRecipient(bossEmail)
            .then(() => {
                setTestReceipt(
                    TestReceipt,
                    'jpg',
                    (source, _, filename) => {
                        const transactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
                        const reportID = generateReportID();
                        initMoneyRequest(reportID, undefined, false, undefined, CONST.IOU.REQUEST_TYPE.SCAN);

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
                        setMoneyRequestCreated(transactionID, format(new Date(), CONST.DATE.FNS_FORMAT_STRING), true);

                        InteractionManager.runAfterInteractions(() => {
                            Navigation.goBack();
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                        });
                    },
                    () => {
                        setIsLoading(false);
                        setFormError(translate('testDrive.modal.employee.error'));
                    },
                );
            })
            .catch(() => {
                setIsLoading(false);
                setFormError(translate('testDrive.modal.employee.error'));
            });
    };

    const skipTestDrive = () => {
        Navigation.dismissModal();
    };

    return (
        <BaseTestDriveModal
            description={translate('testDrive.modal.employee.description')}
            onConfirm={navigate}
            onHelp={skipTestDrive}
            shouldCloseOnConfirm={false}
            shouldRenderHTMLDescription
            avoidKeyboard
            shouldShowConfirmationLoader={isLoading}
            canConfirmWhileOffline={false}
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
