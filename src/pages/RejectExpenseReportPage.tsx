import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
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
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useYourSpendPatchData from '@hooks/useYourSpendPatchData';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail, temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getSortedReportActions} from '@libs/ReportActionsUtils';

import variables from '@styles/variables';

import {rejectExpenseReport} from '@userActions/IOU/RejectMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import INPUT_IDS from '@src/types/form/ReportRejectForm';
import type {PersonalDetailsList, ReportActions} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type RejectExpenseReportPageProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.REPORT_REJECT>;

function lastForwardedActorAccountIDSelector(reportActions: OnyxEntry<ReportActions>) {
    if (!reportActions) {
        return undefined;
    }

    const sortedActions = getSortedReportActions(Object.values(reportActions), true);

    // Walk reverse chronologically. A SUBMITTED action marks the start of the current
    // approval cycle — any FORWARDED actions older than that are stale (from a prior
    // submit→approve→reject→resubmit cycle) and must be ignored.
    let lastForwardedActorAccountID: number | undefined;
    for (const action of sortedActions) {
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.SUBMITTED) {
            break;
        }
        if (action.actionName === CONST.REPORT.ACTIONS.TYPE.FORWARDED && action.actorAccountID) {
            lastForwardedActorAccountID = action.actorAccountID;
            break;
        }
    }

    return lastForwardedActorAccountID;
}

function submitterAndLastForwardedActorEmailSelector(submitterAccountID: number | undefined, lastForwardedActorAccountID: number | undefined) {
    return (personalDetailsList: OnyxEntry<PersonalDetailsList>) => ({
        submitterEmail: personalDetailsLoginSelector(submitterAccountID)(personalDetailsList),
        lastForwardedActorEmail: personalDetailsLoginSelector(lastForwardedActorAccountID)(personalDetailsList),
    });
}

function RejectExpenseReportPage({route}: RejectExpenseReportPageProps) {
    const {reportID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const yourSpendPatchData = useYourSpendPatchData();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [lastForwardedActorAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: lastForwardedActorAccountIDSelector});
    const [{submitterEmail, lastForwardedActorEmail} = getEmptyObject<{submitterEmail: string | undefined; lastForwardedActorEmail: string | undefined}>()] = useOnyx(
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        {
            selector: submitterAndLastForwardedActorEmailSelector(report?.ownerAccountID, lastForwardedActorAccountID),
        },
        [report?.ownerAccountID, lastForwardedActorAccountID],
    );
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [selectedTargetAccountID, setSelectedTargetAccountID] = useState<string>('');
    const [selectionError, setSelectionError] = useState<string>('');
    const isSubmitAttempt = useRef(false);

    const lastForwardedActorDetails = getPersonalDetailByEmail(lastForwardedActorEmail);
    const previousApprover = !lastForwardedActorDetails?.accountID
        ? null
        : {
              accountID: lastForwardedActorDetails.accountID,
              displayName: temporaryGetDisplayNameOrDefault({passedPersonalDetails: lastForwardedActorDetails, translate}),
              email: lastForwardedActorEmail,
          };

    const submitterAccountID = report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const hasPreviousApprover = previousApprover !== null && previousApprover.accountID !== currentUserPersonalDetails?.accountID && previousApprover.accountID !== submitterAccountID;

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

    const submitterName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: getPersonalDetailByEmail(submitterEmail), translate});
    options.push({
        text: `${submitterName} (${translate('iou.rejectReport.submitter')})`,
        alternateText: submitterEmail,
        keyForList: String(submitterAccountID),
        accountID: submitterAccountID,
        isSelected: selectedTargetAccountID === String(submitterAccountID),
    });

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM> = {};
        if (!values[INPUT_IDS.COMMENT]) {
            errors[INPUT_IDS.COMMENT] = translate('common.error.fieldRequired');
        }
        if (isSubmitAttempt.current && hasPreviousApprover && !selectedTargetAccountID) {
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

        const targetAccountID = hasPreviousApprover ? Number(selectedTargetAccountID) : submitterAccountID;
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
            yourSpendPatchData,
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
                isSubmitActionDangerous
                shouldRenderFooterAboveSubmit
                footerContent={selectionError ? <FormHelpMessage message={selectionError} /> : undefined}
            >
                <View style={styles.mb3}>
                    <Text>{translate('iou.rejectReport.description')}</Text>
                </View>
                <View style={styles.mb6}>
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
                </View>
                {hasPreviousApprover && (
                    <View style={styles.mb6}>
                        <Text style={[styles.mb3]}>{translate('iou.rejectReport.selectTarget')}</Text>
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
                    </View>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

RejectExpenseReportPage.displayName = 'RejectExpenseReportPage';

export default RejectExpenseReportPage;
