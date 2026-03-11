import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault, getLoginsByAccountIDs, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getApprovalChain} from '@libs/ReportUtils';
import {rejectExpenseReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ReportRejectForm';

type RejectExpenseReportPageProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.REPORT_REJECT>;

function RejectExpenseReportPage({route}: RejectExpenseReportPageProps) {
    const {reportID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const policy = usePolicy(report?.policyID);
    const [selectedTargetAccountID, setSelectedTargetAccountID] = useState<string>('');

    const previousApprover = useMemo(() => {
        if (!policy || !report) {
            return null;
        }

        const approvalChain = getApprovalChain(policy, report);
        const managerEmail = getLoginsByAccountIDs([report.managerID ?? CONST.DEFAULT_NUMBER_ID]).at(0) ?? '';
        const managerIndex = approvalChain.indexOf(managerEmail);

        if (managerIndex <= 0) {
            return null;
        }

        const previousApproverEmail = approvalChain[managerIndex - 1];
        const details = getPersonalDetailByEmail(previousApproverEmail);
        if (!details?.accountID) {
            return null;
        }

        return {
            accountID: details.accountID,
            displayName: getDisplayNameOrDefault(details),
        };
    }, [policy, report]);

    const submitterAccountID = report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const hasPreviousApprover = previousApprover !== null;

    const targetOptions = useMemo(() => {
        const options = [];

        if (hasPreviousApprover) {
            options.push({
                text: `${previousApprover.displayName} (${translate('iou.rejectReport.lastApprover')})`,
                keyForList: String(previousApprover.accountID),
                isSelected: selectedTargetAccountID === String(previousApprover.accountID),
            });
        }

        const submitterName = getDisplayNameOrDefault(getPersonalDetailByEmail(getLoginsByAccountIDs([submitterAccountID]).at(0) ?? ''));
        options.push({
            text: `${submitterName} (${translate('iou.rejectReport.submitter')})`,
            keyForList: String(submitterAccountID),
            isSelected: selectedTargetAccountID === String(submitterAccountID),
        });

        return options;
    }, [hasPreviousApprover, previousApprover, submitterAccountID, selectedTargetAccountID, translate]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM> = {};
            if (!values[INPUT_IDS.COMMENT]) {
                errors[INPUT_IDS.COMMENT] = translate('common.error.fieldRequired');
            }
            if (hasPreviousApprover && !selectedTargetAccountID) {
                errors[INPUT_IDS.TARGET_ACCOUNT_ID] = translate('iou.rejectReport.selectMemberError');
            }
            return errors;
        },
        [hasPreviousApprover, selectedTargetAccountID, translate],
    );

    const onSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_REJECT_FORM>) => {
            const targetAccountID = hasPreviousApprover ? Number(selectedTargetAccountID) : submitterAccountID;

            rejectExpenseReport(reportID, targetAccountID, values[INPUT_IDS.COMMENT]);
            Navigation.dismissModal();
        },
        [hasPreviousApprover, reportID, selectedTargetAccountID, submitterAccountID],
    );

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
                enabledWhenOffline
                shouldHideFixErrorsAlert
                isSubmitActionDangerous
            >
                <View style={styles.mb6}>
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
                    />
                </View>
                {hasPreviousApprover && (
                    <View style={styles.mb6}>
                        <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('iou.rejectReport.selectTarget')}</Text>
                        <SelectionList
                            data={targetOptions}
                            ListItem={RadioListItem}
                            onSelectRow={(item) => setSelectedTargetAccountID(item.keyForList ?? '')}
                            initiallyFocusedOptionKey={selectedTargetAccountID}
                        />
                    </View>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

RejectExpenseReportPage.displayName = 'RejectExpenseReportPage';

export default RejectExpenseReportPage;
