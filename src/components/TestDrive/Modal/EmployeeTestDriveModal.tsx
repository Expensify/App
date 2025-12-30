import {useRoute} from '@react-navigation/native';
import {format} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import TestReceipt from '@assets/images/fake-test-drive-employee-receipt.jpg';
import TextInput from '@components/TextInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
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
import type AccountExistsError from '@libs/Errors/AccountExistsError';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TestDriveModalNavigatorParamList} from '@libs/Navigation/types';
import {hasOnlyPersonalPolicies as hasOnlyPersonalPoliciesUtil} from '@libs/PolicyUtils';
import {generateReportID} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseTestDriveModal from './BaseTestDriveModal';

function EmployeeTestDriveModal() {
    const {translate} = useLocalize();
    const reportID = generateReportID();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});
    const route = useRoute<PlatformStackRouteProp<TestDriveModalNavigatorParamList, typeof SCREENS.TEST_DRIVE_MODAL.ROOT>>();
    const [bossEmail, setBossEmail] = useState(route.params?.bossEmail ?? '');
    const [formError, setFormError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const {testDrive} = useOnboardingMessages();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const hasOnlyPersonalPolicies = useMemo(() => hasOnlyPersonalPoliciesUtil(allPolicies), [allPolicies]);

    const onBossEmailChange = useCallback((value: string) => {
        setBossEmail(value);
        setFormError(undefined);
    }, []);

    const navigate = () => {
        Log.hmmm('[EmployeeTestDriveModal] Navigate function called', {bossEmail});
        const loginTrim = bossEmail.trim();
        if (!loginTrim || !Str.isValidEmail(loginTrim)) {
            setFormError(translate('common.error.email'));
            return;
        }

        setIsLoading(true);

        verifyTestDriveRecipient(bossEmail)
            .then(() => {
                Log.hmmm('[EmployeeTestDriveModal] Test drive recipient verified');
                setTestReceipt(
                    TestReceipt,
                    'jpg',
                    (source, _, filename) => {
                        const transactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;

                        initMoneyRequest({
                            reportID,
                            personalPolicy,
                            isFromGlobalCreate: false,
                            newIouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                            report,
                            parentReport,
                            currentDate,
                            currentUserPersonalDetails,
                            hasOnlyPersonalPolicies,
                        });

                        setMoneyRequestReceipt(transactionID, source, filename, true, CONST.TEST_RECEIPT.FILE_TYPE, false, true);

                        setMoneyRequestParticipants(transactionID, [
                            {
                                accountID: generateAccountID(bossEmail),
                                login: bossEmail,
                                displayName: bossEmail,
                                selected: true,
                            },
                        ]);
                        setMoneyRequestAmount(transactionID, testDrive.EMPLOYEE_FAKE_RECEIPT.AMOUNT, testDrive.EMPLOYEE_FAKE_RECEIPT.CURRENCY);
                        setMoneyRequestDescription(transactionID, testDrive.EMPLOYEE_FAKE_RECEIPT.DESCRIPTION, true);
                        setMoneyRequestMerchant(transactionID, testDrive.EMPLOYEE_FAKE_RECEIPT.MERCHANT, true);
                        setMoneyRequestCreated(transactionID, format(new Date(), CONST.DATE.FNS_FORMAT_STRING), true);

                        Log.hmmm('[EmployeeTestDriveModal] Running after interactions');
                        Navigation.goBack();
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            Log.hmmm('[EmployeeTestDriveModal] Calling Navigation.goBack() and Navigation.navigate()');
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                        });
                    },
                    () => {
                        Log.hmmm('[EmployeeTestDriveModal] Error setting test receipt');
                        setIsLoading(false);
                        setFormError(translate('common.genericErrorMessage'));
                    },
                );
            })
            .catch((e: AccountExistsError) => {
                Log.hmmm('[EmployeeTestDriveModal] Error verifying test drive recipient', {error: e});
                setIsLoading(false);
                setFormError(e.translationKey ? translate(e.translationKey) : 'common.genericErrorMessage');
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
            shouldCallOnHelpWhenModalHidden
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

export default EmployeeTestDriveModal;
