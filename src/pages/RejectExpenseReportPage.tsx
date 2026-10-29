import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormFieldGroup from '@components/Form/Layout/FormFieldGroup';
import FormFields from '@components/Form/Layout/FormFields';
import FormHeader from '@components/Form/Layout/FormHeader';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import variables from '@styles/variables';

import {rejectExpenseReport} from '@userActions/IOU/RejectMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {currentCycleForwardedActorAccountIDsSelector, submitterAndLastForwardedActorEmailSelector} from '@src/selectors/RejectExpenseReport';
import INPUT_IDS from '@src/types/form/ReportRejectForm';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type RejectExpenseReportPageProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.REPORT_REJECT>;

function RejectExpenseReportPage({route}: RejectExpenseReportPageProps) {
    const {reportID} = route.params;
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [forwardedActorAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {
        selector: currentCycleForwardedActorAccountIDsSelector,
    });
    const [{submitterEmail, lastForwardedActorEmail} = getEmptyObject<{submitterEmail: string | undefined; lastForwardedActorEmail: string | undefined}>()] = useAllPersonalDetails(
        submitterAndLastForwardedActorEmailSelector(report?.ownerAccountID, forwardedActorAccountIDs, currentUserPersonalDetails?.accountID, policy),
    );
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [selectedTargetAccountID, setSelectedTargetAccountID] = useState<string>('');
    const [selectionError, setSelectionError] = useState<string>('');
    const isSubmitAttempt = useRef(false);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const lastForwardedActorDetails = usePersonalDetailByLogin(lastForwardedActorEmail);

    const previousApprover = !lastForwardedActorDetails?.accountID
        ? null
        : {
              accountID: lastForwardedActorDetails.accountID,
              displayName: temporaryGetDisplayNameOrDefault({passedPersonalDetails: lastForwardedActorDetails, translate, formatPhoneNumber}),
              email: lastForwardedActorEmail,
          };

    const submitterAccountID = report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const hasPreviousApprover = previousApprover !== null;

    const options = [];

    if (hasPreviousApprover) {
        options.push({
            text: `${previousApprover.displayName} (${translate('iou.rejectReport.lastApprover')})`,
            alternateText: previousApprover.email,
            keyForList: String(previousApprover.accountID),
            accountID: previousApprover.accountID,
            isSelected: selectedTargetAccountID === String(previousApprover.accountID),
        });
    }

    const submitterName = usePersonalDetailByLogin(submitterEmail, (personalDetails) =>
        temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails, translate, formatPhoneNumber}),
    );
    options.push({
        text: `${submitterName} (${translate('iou.rejectReport.submitter')})`,
        alternateText: submitterEmail,
        keyForList: String(submitterAccountID),
        accountID: submitterAccountID,
        isSelected: selectedTargetAccountID === String(submitterAccountID),
    });

    const validSelectedTargetAccountID = options.some((option) => option.keyForList === selectedTargetAccountID) ? selectedTargetAccountID : '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM> = {};
        if (!values[INPUT_IDS.COMMENT]) {
            errors[INPUT_IDS.COMMENT] = translate('common.error.fieldRequired');
        }
        if (isSubmitAttempt.current && hasPreviousApprover && !validSelectedTargetAccountID) {
            setSelectionError(translate('iou.rejectReport.selectMemberError'));
            errors[INPUT_IDS.COMMENT] = errors[INPUT_IDS.COMMENT] ?? undefined;
        } else if (isSubmitAttempt.current) {
            setSelectionError('');
        }
        isSubmitAttempt.current = false;
        return errors;
    };

    const handleBeforeSubmit = () => {
        isSubmitAttempt.current = true;
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM>) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        const targetAccountID = hasPreviousApprover ? Number(validSelectedTargetAccountID) : submitterAccountID;
        if (!report) {
            return;
        }
        rejectExpenseReport(
            report,
            targetAccountID,
            values[INPUT_IDS.COMMENT],
            currentUserPersonalDetails?.accountID,
            currentUserPersonalDetails?.displayName,
            currentUserPersonalDetails?.avatar,
            isTrackIntentUser,
            delegateAccountID,
            rules,
        );
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="RejectExpenseReportPage"
        >
            <HeaderWithBackButton
                title={translate('iou.rejectReport.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.REPORT_REJECT_FORM}
                submitButtonText={translate('iou.rejectReport.title')}
                style={[styles.flexGrow1, styles.ph5]}
                onSubmit={onSubmit}
                validate={validate}
                onBeforeSubmit={handleBeforeSubmit}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                buttonVariant={CONST.BUTTON_VARIANT.DANGER}
                shouldRenderFooterAboveSubmit
                footerContent={selectionError ? <FormHelpMessage message={selectionError} /> : undefined}
            >
                <FormHeader description={translate('iou.rejectReport.description')} />
                <FormFields>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMMENT}
                        valueType="string"
                        name="comment"
                        defaultValue={undefined}
                        label={translate('iou.rejectReport.rejectReason')}
                        accessibilityLabel={translate('iou.rejectReport.rejectReason')}
                        ref={inputCallbackRef}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                    />
                    {hasPreviousApprover && (
                        <FormFieldGroup>
                            <Text>{translate('iou.rejectReport.selectTarget')}</Text>
                            <View style={styles.mhn5}>
                                <SelectionList
                                    data={options}
                                    ListItem={UserListItem}
                                    onSelectRow={(item) => {
                                        setSelectedTargetAccountID(item.keyForList ?? '');
                                        setSelectionError('');
                                    }}
                                    initiallyFocusedItemKey={selectedTargetAccountID}
                                />
                            </View>
                        </FormFieldGroup>
                    )}
                </FormFields>
            </FormProvider>
        </ScreenWrapper>
    );
}

RejectExpenseReportPage.displayName = 'RejectExpenseReportPage';

export default RejectExpenseReportPage;
