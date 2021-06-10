/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';

const WITHDRAWAL_ACCOUNT_STEPS = [
    {
        id: 'BankAccountStep',
        title: 'Bank Account',
    },
    {
        id: 'CompanyStep',
        title: 'Company Information',
    },
    {
        id: 'RequestorStep',
        title: 'Requestor Information',
    },
    {
        id: 'ACHContractStep',
        title: 'Beneficial Owners',
    },
    {
        id: 'ValidationStep',
        title: 'Validate',
    },
    {
        id: 'EnableStep',
        title: 'Enable',
    },
];

const propTypes = {
    skipOnfido: PropTypes.bool,
};

const defaultProps = {
    skipOnfido: false,
};

class ReimbursementAccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            bankAccountID: undefined,
            isLoading: true,
            isPlaidDisabled: false,
            achData: {},
            isWithdrawal: true,
            lastDataWithError: {},
            currentStep: 'BankAccountStep',
        };
    }

    componentDidMount() {
        // If the user already is already setting up a bank account we will want to continue the flow for them
        let currentStep;
        const bankAccountID = parseInt(this.props.bankAccountID, 10) || 0; // This will need to come from either NVP or route param
        const bankAccount = bankAccountID ? this.props.bankAccounts[bankAccountID] : null; // The list of bankAccounts will need to come from Onyx
        const achData = bankAccount ? bankAccount.toACHData() : {};
        achData.useOnfido = !this.props.skipOnfido;
        achData.policyID = this.props.policyId || '';
        achData.plaidLinkToken = this.props.plaidLinkToken; // I think probably we won't have this until we start the Plaid flow but maybe...?
        achData.isInSetup = !bankAccount || bankAccount.isInSetup();
        achData.bankAccountInReview = bankAccount && bankAccount.isVerifying();
        achData.domainLimi = 0;
        achData.isDomainUsingExpensifyCard = false; // Maybe also needs to be a prop... not too sure.
        achData.subStep = this.props.subStep; // Unsure what the substeps are used for so far...

        // If we're not in setup, it means we already have a withdrawal account and we're upgrading it to a business bank account.
        // So let the user review all steps with all info prefilled and editable, unless a specific step was passed.
        if (!achData.isInSetup) {
            currentStep = this.props.currentStep; // Not sure if we need this as user's won't be upgrading these accounts...
        }

        // Temporary fix for Onfido flow. Can be removed by nkuoch after Sept 1 2020. - not sure if we need this or what this is about...
        if (currentStep === 'ACHContractStep' && achData.useOnfido) {
            const onfidoRes = lodashGet(achData, 'verifications.externalApiResponses.requestorIdentityOnfido');
            const sdkToken = lodashGet(onfidoRes, 'apiResult.sdkToken');
            if (sdkToken && !achData.isOnfidoSetupComplete && onfidoRes.status !== 'pass') {
                currentStep = 'RequestorStep';
            }
        }

        // Ensure we route the user to the correct step based on the status of their bank account
        if (bankAccount && !currentStep) {
            currentStep = bankAccount.isPending() || bankAccount.isVerifying() ? 'ValidationStep' : 'BankAccountStep';

            // Again, not sure how much of this logic is needed right now as we shouldn't be handling any open accounts in E.cash yet...
            if (bankAccount.isOpen()) {
                if (bankAccount.needsToPassLatestChecks()) {
                    // const hasTriedToUpgrade = bankAccount.getDateSigned() > (NVP.get('expensify_migration_2020_04_28_RunKycVerifications') || '2020-01-13');
                    // currentStep = hasTriedToUpgrade ? 'ValidationStep' : 'CompanyStep';
                    // achData.bankAccountInReview = hasTriedToUpgrade;
                } else {
                    // Not handling the EnableStep...
                    // currentStep = 'EnableStep';
                }
            }
        }

        // If at this point we still don't have a current step, default to the BankAccountStep
        if (!currentStep) {
            currentStep = 'BankAccountStep';
        }

        console.log({currentStep, achData});
        this.setState({isLoading: false, currentStep, achData});
    }

    render() {
        if (this.state.isLoading) {
            return null;
        }

        return (
            <ScreenWrapper>
                <View />
            </ScreenWrapper>
        );
    }
}

ReimbursementAccountPage.propTypes = propTypes;
ReimbursementAccountPage.defaultProps = defaultProps;
export default ReimbursementAccountPage;
