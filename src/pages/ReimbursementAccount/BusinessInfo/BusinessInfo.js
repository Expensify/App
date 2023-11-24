import {parsePhoneNumber} from 'awesome-phonenumber';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import Navigation from '@libs/Navigation/Navigation';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import getInitialSubstepForBusinessInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForBusinessInfo';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AddressBusiness from './substeps/AddressBusiness';
import ConfirmationBusiness from './substeps/ConfirmationBusiness';
import IncorporationDateBusiness from './substeps/IncorporationDateBusiness';
import IncorporationStateBusiness from './substeps/IncorporationStateBusiness';
import NameBusiness from './substeps/NameBusiness';
import PhoneNumberBusiness from './substeps/PhoneNumberBusiness';
import TaxIdBusiness from './substeps/TaxIdBusiness';
import TypeBusiness from './substeps/TypeBusiness';
import WebsiteBusiness from './substeps/WebsiteBusiness';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /* The workspace policyID */
    policyID: PropTypes.string,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
    policyID: '',
};

const STEPS_HEADER_HEIGHT = 40;
// TODO Will most likely come from different place
const STEP_NAMES = ['1', '2', '3', '4', '5'];

const bodyContent = [
    NameBusiness,
    TaxIdBusiness,
    WebsiteBusiness,
    PhoneNumberBusiness,
    AddressBusiness,
    TypeBusiness,
    IncorporationDateBusiness,
    IncorporationStateBusiness,
    ConfirmationBusiness,
];

const businessInfoStepKeys = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

function BusinessInfo({reimbursementAccount, reimbursementAccountDraft, policyID}) {
    const {translate} = useLocalize();

    /**
     * @param {Array} fieldNames
     *
     * @returns {*}
     */
    const getBankAccountFields = useCallback(
        (fieldNames) => ({
            ..._.pick(lodashGet(reimbursementAccount, 'achData'), ...fieldNames),
            ..._.pick(reimbursementAccountDraft, ...fieldNames),
        }),
        [reimbursementAccount, reimbursementAccountDraft],
    );

    const values = useMemo(() => getSubstepValues(businessInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const submit = useCallback(() => {
        const payload = {
            bankAccountID: getDefaultValueForReimbursementAccountField(reimbursementAccount, 'bankAccountID', 0),
            ...values,
            ...getBankAccountFields(['routingNumber', 'accountNumber', 'bankName', 'plaidAccountID', 'plaidAccessToken', 'isSavings']),
            companyTaxID: values.companyTaxID.replace(CONST.REGEX.NON_NUMERIC, ''),
            companyPhone: parsePhoneNumber(values.companyPhone, {regionCode: CONST.COUNTRY.US}).number.significant,
        };

        BankAccounts.updateCompanyInformationForBankAccount(payload, policyID);
    }, [reimbursementAccount, values, getBankAccountFields, policyID]);

    const startFrom = useMemo(() => getInitialSubstepForBusinessInfo(values), [values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack(ROUTES.HOME);
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper
            testID={BusinessInfo.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('businessInfoStep.businessInfo')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mv3, {height: STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    // TODO Will be replaced with proper values
                    startStep={1}
                    stepNames={STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

BusinessInfo.propTypes = propTypes;
BusinessInfo.defaultProps = defaultProps;
BusinessInfo.displayName = 'BusinessInfo';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(BusinessInfo);
