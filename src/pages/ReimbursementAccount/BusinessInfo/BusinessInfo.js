import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import useSubStep from '../../../hooks/useSubStep';
import ONYXKEYS from '../../../ONYXKEYS';
import {reimbursementAccountPropTypes} from '../reimbursementAccountPropTypes';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import InteractiveStepSubHeader from '../../../components/InteractiveStepSubHeader';
import useLocalize from '../../../hooks/useLocalize';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import ScreenWrapper from '../../../components/ScreenWrapper';
import getDefaultStateForField from '../utils/getDefaultStateForField';
import NameBusiness from './substeps/NameBusiness';
import TaxIdBusiness from './substeps/TaxIdBusiness';
import WebsiteBusiness from './substeps/WebsiteBusiness';
import PhoneNumberBusiness from './substeps/PhoneNumberBusiness';
import AddressBusiness from './substeps/AddressBusiness';
import TypeBusiness from './substeps/TypeBusiness';
import IncorporationDateBusiness from './substeps/IncorporationDateBusiness';
import IncorporationStateBusiness from './substeps/IncorporationStateBusiness';
import ConfirmationBusiness from './substeps/ConfirmationBusiness';
import getSubstepValues from '../utils/getSubstepValues';
import reimbursementAccountDraftPropTypes from '../ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountProps from '../reimbursementAccountPropTypes';
import getInitialSubstepForBusinessInfo from '../utils/getInitialSubstepForBusinessInfo';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
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

function BusinessInfo({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const submit = useCallback(() => {
        const values = getSubstepValues(businessInfoStepKeys, reimbursementAccountDraft, reimbursementAccount);

        const payload = {
            bankAccountID: getDefaultStateForField({reimbursementAccount, fieldName: 'bankAccountID', defaultValue: 0}),
            ...values,
        };

        BankAccounts.updateCompanyInformationForBankAccount(payload);
    }, [reimbursementAccount, reimbursementAccountDraft]);

    const startFrom = useMemo(() => getInitialSubstepForBusinessInfo(lodashGet(reimbursementAccount, ['achData'], {})), [reimbursementAccount]);

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
                    startStep={2}
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
