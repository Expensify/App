import React, {useMemo} from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import subStepPropTypes from '../../subStepPropTypes';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import TextLink from '../../../../components/TextLink';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import Button from '../../../../components/Button';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import * as ErrorUtils from '../../../../libs/ErrorUtils';
import DotIndicatorMessage from '../../../../components/DotIndicatorMessage';
import reimbursementAccountDraftPropTypes from '../../ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountProps from '../../reimbursementAccountPropTypes';
import getSubstepValues from '../../utils/getSubstepValues';
import CheckboxWithLabel from '../../../../components/CheckboxWithLabel';
import getDefaultStateForField from '../../utils/getDefaultStateForField';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const businessInfoStepKeys = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

function ConfirmationBusiness({reimbursementAccount, reimbursementAccountDraft, onNext, onMove}) {
    const {translate} = useLocalize();

    const values = useMemo(() => getSubstepValues(businessInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount);

    const defaultCheckboxState = getDefaultStateForField({reimbursementAccount, fieldName: businessInfoStepKeys.HAS_NO_CONNECTION_TO_CANNABIS, defaultValue: false});

    return (
        <ScreenWrapper
            testID={ConfirmationBusiness.displayName}
            style={[styles.pt0]}
            scrollEnabled
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadline, styles.ph5, styles.mb0]}>{translate('businessInfoStep.letsDoubleCheck')}</Text>
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.businessName')}
                    title={values[businessInfoStepKeys.COMPANY_NAME]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(0);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.taxIDNumber')}
                    title={values[businessInfoStepKeys.COMPANY_TAX_ID]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(1);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('common.companyAddress')}
                    title={`${values[businessInfoStepKeys.STREET]}, ${values[businessInfoStepKeys.CITY]}, ${values[businessInfoStepKeys.STATE]} ${values[businessInfoStepKeys.ZIP_CODE]}`}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(4);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('common.phoneNumber')}
                    title={values[businessInfoStepKeys.COMPANY_PHONE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(3);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.companyWebsite')}
                    title={values[businessInfoStepKeys.COMPANY_WEBSITE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(2);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.companyType')}
                    title={values[businessInfoStepKeys.INCORPORATION_TYPE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(5);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.incorporationDate')}
                    title={values[businessInfoStepKeys.INCORPORATION_DATE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(6);
                    }}
                />
                <MenuItemWithTopDescription
                    description={translate('businessInfoStep.incorporationState')}
                    title={values[businessInfoStepKeys.INCORPORATION_STATE]}
                    shouldShowRightIcon
                    onPress={() => {
                        onMove(7);
                    }}
                />
                <View style={styles.ph5}>
                    <CheckboxWithLabel
                        accessibilityLabel={`${translate('businessInfoStep.confirmCompanyIsNot')} ${translate('businessInfoStep.listOfRestrictedBusinesses')}`}
                        inputID={businessInfoStepKeys.HAS_NO_CONNECTION_TO_CANNABIS}
                        defaultValue={defaultCheckboxState}
                        LabelComponent={() => (
                            <Text>
                                {`${translate('businessInfoStep.confirmCompanyIsNot')} `}
                                <TextLink
                                    // eslint-disable-next-line max-len
                                    href="https://community.expensify.com/discussion/6191/list-of-restricted-businesses"
                                >
                                    {`${translate('businessInfoStep.listOfRestrictedBusinesses')}.`}
                                </TextLink>
                            </Text>
                        )}
                        style={[styles.mt4]}
                        shouldSaveDraft
                        onInputChange={() => {}}
                    />
                </View>

                <View style={[styles.ph5, styles.mtAuto]}>
                    {error.length > 0 && (
                        <DotIndicatorMessage
                            textStyles={[styles.formError]}
                            type="error"
                            messages={{0: error}}
                        />
                    )}
                    <Button
                        success
                        style={[styles.w100, styles.mt2, styles.pb5]}
                        onPress={onNext}
                        text={translate('common.confirm')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

ConfirmationBusiness.propTypes = propTypes;
ConfirmationBusiness.defaultProps = defaultProps;
ConfirmationBusiness.displayName = 'ConfirmationBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(ConfirmationBusiness);
