/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
import _ from 'underscore';
import moment from 'moment';
import lodashGet from 'lodash/get';
import lodashHas from 'lodash/has';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import {fetchFreePlanVerifiedBankAccount} from '../libs/actions/BankAccounts';
import ONYXKEYS from '../ONYXKEYS';
import BankAccount from '../libs/models/BankAccount';
import * as API from '../libs/API';

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
    freePlanBankAccount: PropTypes.shape({
        bankAccount: PropTypes.shape({}),
        loading: PropTypes.bool,
        throttledDate: PropTypes.string,
    }),
};

const defaultProps = {
    skipOnfido: false,
    freePlanBankAccount: {
        loading: true,
    },
};

class ReimbursementAccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            bankAccountID: undefined,
            isLoading: true,

            // In Web-Secure Plaid is disabled if there is no window.Plaid global (SDK script didn't load) or if we explicitly disable it because the user made too many calls to BankAccount_Get
            // See: https://github.com/Expensify/Web-Secure/blob/044c82affb78812a58b881a6d5ba026d91dace3b/site/app/settings/reimbursement/PlaidBankForm.jsx#L171-L176
            // @TODO we should handle the too many calls to Plaid situation, but for now it will remain enabled
            isPlaidDisabled: false,
            achData: {},
            isWithdrawal: true,
            lastDataWithError: {},
            currentStep: 'BankAccountStep',
        };
    }

    componentDidMount() {
        fetchFreePlanVerifiedBankAccount();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.freePlanBankAccount.loading && !this.props.freePlanBankAccount.loading) {
            this.init();
        }
    }

    /**
     * Get step position in the array
     * @param {String} stepID
     * @return {Number}
     */
    getIndexByStepID(stepID) {
        return _.findIndex(WITHDRAWAL_ACCOUNT_STEPS, step => step.id === stepID);
    }

    /**
     * Get next step ID
     * @return {String}
     */
    getNextStepID() {
        const nextStepIndex = Math.min(this.getIndexByStepID(this.state.achData.currentStep) + 1, WITHDRAWAL_ACCOUNT_STEPS.length - 1);
        return lodashGet(WITHDRAWAL_ACCOUNT_STEPS, [nextStepIndex, 'id'], 'BankAccountStep');
    }

    /**
     * Create or update the bank account in db with the updated data.
     *
     * @param {Object} [data]
     */
    setupWithdrawalAccount(data) {
        // @TODO trigger loading

        // Create a shallow copy of the data and overwrite new values
        const newAchData = {...this.state.achData};
        _.extend(newAchData, data);
        if (data && data.isSavings !== undefined) {
            newAchData.isSavings = Boolean(data.isSavings);
        }
        if (!newAchData.setupType) {
            newAchData.setupType = newAchData.plaidAccountID ? 'plaid' : 'manual';
        }

        let nextStep = newAchData.currentStep;

        // @TODO move this to an action instead
        API.BankAccount_SetupWithdrawal(newAchData)
            .finally((response) => {
                // @TODO hide the loader

                const currentStep = newAchData.currentStep;
                let achData = response.achData;
                let error = lodashGet(achData, 'verifications.errorMessage');

                if (response.jsonCode === 200 && !error) {
                    // Show warning if another account already set up this bank account and promote share
                    if (response.existingOwners) {
                        // @TODO Show error about existing owners
                        return;
                    }

                    if (currentStep === 'RequestorStep') {
                        const requestorResponse = lodashGet(achData, 'verifications.externalApiResponses.requestorIdentityID');
                        if (newAchData.useOnfido) {
                            const onfidoRes = lodashGet(achData, 'verifications.externalApiResponses.requestorIdentityOnfido');
                            const sdkToken = lodashGet(onfidoRes, 'apiResult.sdkToken');
                            if (sdkToken && !newAchData.isOnfidoSetupComplete && onfidoRes.status !== 'pass') {
                                // Requestor Step still needs to run Onfido
                                achData.sdkToken = sdkToken;
                                this.setState({achData: newAchData}, () => {
                                    this.goToStepID('RequestorStep', achData);
                                });
                                return;
                            }
                        } else if (requestorResponse) {
                            // Don't go to next step if Requestor Step needs to ask some questions
                            let questions = lodashGet(requestorResponse, 'apiResult.questions.question') || [];
                            if (_.isEmpty(questions)) {
                                const differentiatorQuestion = lodashGet(requestorResponse, 'apiResult.differentiator-question');
                                if (differentiatorQuestion) {
                                    questions = [differentiatorQuestion];
                                }
                            }
                            if (!_.isEmpty(questions)) {
                                achData.questions = questions;
                                this.setState({achData: newAchData}, () => {
                                    this.goToStepID('RequestorStep', achData);
                                });
                                return;
                            }
                        }
                    }
                    if (currentStep === 'ACHContractStep') {
                        // const promise = $.Deferred(); // Not sure what is awaiting this promise yet but doesn't seem like something we will want to do...

                        // We want to make a task completion so we can pay guides, but we don't want to close the iframe so mark completeSetup as false
                        // this.triggerParentSuccessMessage(response, false); - Not really sure if this applies in E.cash

                        // Get an up-to-date bank account list so that we can allow the user to validate their newly generated bank account
                        return API.get({returnValueList: 'bankAccountList'})
                            .done((json) => {
                                const bankAccount = new BankAccount(_.findWhere(json.bankAccountList, {bankAccountID: newAchData.bankAccountID}));
                                achData = bankAccount.toACHData();
                                const needsToPassLatestChecks = achData.state === BankAccount.STATE.OPEN && achData.needsToPassLatestChecks;
                                achData.bankAccountInReview = needsToPassLatestChecks || achData.state === BankAccount.STATE.VERIFYING;
                                this.setState({achData: newAchData}, () => {
                                    this.goToStepID('ValidationStep', achData);
                                });
                            });
                    }
                    if ((currentStep === 'ValidationStep' && newAchData.bankAccountInReview) || currentStep === 'EnableStep') {
                        // Setup done! We can close the modal - @TODO - not sure what this is doing or if we need it
                        // this.triggerParentSuccessMessage(response);
                    } else {
                        nextStep = this.getNextStepID();
                    }
                } else {
                    if (response.jsonCode === 666) {
                        error = response.message;
                    }
                    if (lodashGet(achData, 'verifications.throttled')) {
                        achData.disableFields = true;
                    }
                }

                // Go to next step
                this.setState({achData: newAchData}, () => {
                    this.goToStepID(nextStep, achData);
                });

                if (error) {
                    // @TODO - Show the error
                }
            });
    }

    getDefaultCountry() {
        const defaultCountry = this.state.achData.country || 'US'; // @TODO - In Web-Expensify this fallback refers to User.getIpCountry()

        // In Web-Secure we check the policy to find out the defaultCountry. The policy is passed in here:
        // https://github.com/Expensify/Web-Expensify/blob/896941794f68d7dce64466d83a3e86a5f8122e45/site/app/policyEditor/policyEditorPage.jsx#L2169-L2171
        // @TODO figure out whether we need to check the policy or not - not sure if it's necessary for V1 of Free Plan
        return defaultCountry;
    }

    /**
     * Go to a specific step id.
     * @param {String} stepID
     * @param {Object} [achData]
     */
    goToStepID(stepID, achData) {
        // Setting state again will refresh the view and progress us to the next step
        this.setState((prevState) => {
            const newAchData = {...prevState.achData};

            // If we go back to Requestor Step, reset any validation and previously answered questions from expectID.
            if (!newAchData.useOnfido && stepID === 'RequestorStep') {
                delete newAchData.questions;
                delete newAchData.answers;
                if (lodashHas(newAchData, 'verifications.externalApiResponses')) {
                    delete newAchData.verifications.externalApiResponses.requestorIdentityID;
                    delete newAchData.verifications.externalApiResponses.requestorIdentityKBA;
                }
            }

            // When going from companyStep to bankAccountStep, show the manual form instead of Plaid
            if (newAchData.currentStep === 'CompanyStep' && stepID === 'BankAccountStep') {
                newAchData.subStep = 'manual';
            }

            _.extend(newAchData, achData, {currentStep: stepID});
            return ({achData: newAchData});
        });
    }

    init() {
        // If the user already is already setting up a bank account we will want to continue the flow for them
        let currentStep;
        const bankAccountJSON = parseInt(lodashGet(this.props, 'freePlanBankAccount.bankAccount.bankAccountID', '0'), 10) || 0;
        const bankAccount = bankAccountJSON ? new BankAccount(bankAccountJSON) : null;
        const achData = bankAccount ? bankAccount.toACHData() : {};
        achData.useOnfido = !this.props.skipOnfido;
        achData.policyID = this.props.policyId || '';
        achData.plaidLinkToken = this.props.plaidLinkToken; // I think probably we won't have this until we start the Plaid flow but maybe...?
        achData.isInSetup = !bankAccount || bankAccount.isInSetup();
        achData.bankAccountInReview = bankAccount && bankAccount.isVerifying();
        achData.domainLimi = 0;
        achData.isDomainUsingExpensifyCard = false; // Maybe also needs to be a prop... not too sure.

        // Unsure what the substeps are used for so far... pretty sure it's just to advance to the "login" step here and not used anywhere else
        // https://github.com/Expensify/Web-Expensify/blob/896941794f68d7dce64466d83a3e86a5f8122e45/site/app/settings/reimbursement/bankAccountView.jsx#L356-L357
        achData.subStep = this.props.subStep;

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

        this.setState({isLoading: false, currentStep, achData}, () => {
            // @TODO this isn't really ideal - mostly doing this so we don't have to deviate too far from what is being migrated from Web-Secure for now.
            this.goToStepID(currentStep, achData);
        });
    }

    render() {
        if (this.props.freePlanBankAccount.loading) {
            return null;
        }

        const defaultCountry = this.getDefaultCountry();
        const personalDetails = {firstName: this.props.personalDetails.firstName, lastName: this.props.personalDetails.lastName};
        const userHasPhonePrimaryEmail = Str.endsWith(this.props.session.email, '@expensify.sms');

        // These are all the parameters passed to React.v.AddWithdrawalAccountForm
        console.debug({
            defaultCountry,
            personalDetails,
            userHasPhonePrimaryEmail,
            achData: this.state.achData,
            steps: WITHDRAWAL_ACCOUNT_STEPS,
            isPlaidDisabled: this.state.isPlaidDisabled,
        });

        // React.v.AddWithdrawalAccountForm mostly exists to
        // 1. show a message about being throttled
        // 2. show the step progress bar (that we're not using here)
        // 3. block people who have primary phone logins from adding VBA
        // https://github.com/Expensify/Web-Secure/blob/044c82affb78812a58b881a6d5ba026d91dace3b/site/app/dialogs/reimbursementAccount/addWithdrawalAccountForm.jsx#L56-L73

        if (userHasPhonePrimaryEmail) {
            // @TODO message explaining that they need to make their primary login an email
            return null;
        }

        // See if they is throttled
        const throttledDate = lodashGet(this.props, 'freePlanBankAccount.throttledDate');
        if (throttledDate) {
            const throttledEnd = moment().add(24, 'hours');
            if (moment() < throttledEnd) {
                // @TODO message explaining that the user has been throttled
                return null;
            }
        }

        // If we made it this far then we will render React.v.AddBankAccountForm with the isWithdrawal passed and the following params
        console.debug({
            achData: this.state.achData,
            defaultCountry,
            preventCountryEdit: false, // Maybe we don't need to worry about this yet since there is no country selection?
            personalDetails,
            userHasPhonePrimaryEmail,
            steps: WITHDRAWAL_ACCOUNT_STEPS,
            isPlaidDisabled: this.state.isPlaidDisabled,
        });

        // This is where stuff gets fun... this form is used for both withdrawal and deposit accounts and displays the "step views" there are also some controls for
        // navigating to next and previous steps, error, and loading states etc. Errors + loaders are set with PubSub events. We will likely want to use Onyx for that
        // instead. One thing we are going to run into though is that the "stepped" view doesn't really work so great with react-navigation. But we can refactor it later
        // to improve the UX and naively just swap the views for now with no transitions just to get something cooking in this big monolithic view.

        // Submitting a form - there is a global submit method that will capture the input of whatever child view is rendered... we're not gonna do that because it's
        // sort of a tough pattern to understand IMO.

        // We also let a child view tell us whether it has a "nextStep" or not based on whether it has implemented a nextStep() method. This practice is also really
        // strange IMO and hard to wrap one's head around. As an alternative I'd suggest that each view just fire off an action on submit. There is also something like a
        // validate() class method interface that gets called on submit. We should just let each view handle it's own validation instead IMO to keep the logic in one spot.
        // If something hasn't implemented the nextStep() method then we tell the controller (this component currently) to figure out what to do next + pass it the form
        // values (which are also grabbed from a weird interface method). All of this stuff makes understanding the code extremely difficult so I want to basically follow
        // this pattern instead of the interface/getFunctionFromDeepestView() style which is damn near impossible to reason about...

        // Each view will:
        // 1. Implement it's own validation
        // 2. Implement it's own submit method
        // 3. Store it's form values on state

        // There are also "previousStep" methods that should now be implemented by each view and not called from a parent function but rather the view itself

        // With all of that out of the way, here's a break down of each step in the Withdrawal account flow and which methods it is implementing...

        /**
         * BankAccountStep (React.v.BankAccountStep)
         *    - This one is tricky because it also has it's own "sub steps" and even implemented a history stack - so our "magic" methods might be found on the sub steps
         *    - AddBankCountry - this is a country selector that has implemented a nextStep() method so when the form is submitted it will call onCountryCurrencySubmit()
         *    - AddAccountNumbersManually - This is basically the manual account adding flow and it has no magic methods - but it does have form values so on submit it will
         *        call ReimbursementAccountPage.nextStep() which will call ReimbursementAccountPage.setupWithdrawalAccount() with those values
         *    - PlaidBankForm -
         *        - has a previousStep() implemented to either take us back to the `login` step if we are looking at the list of accounts or to call
         *            ReimbursementAccountPage.previousStep() - I think one way we can improve this is to just get rid of the whole next/previous step concept as controlled by
         *            ReimbursementAccountPage and instead just explicitly navigate to the next view from inside another one... it's all too magical!
         *        - Similar to the BankAccountStep itself the PlaidBankForm also has it's own "steps" which are 'accounts' and 'login'
         *            - PlaidLogin - offers the add method selection either plaid or manual
         *              - plaid
         *                  - Login with Plaid (or switch to manual mode under certain conditions)
         *                  - Call getPlaidBankAccounts() which calls BankAccount_Get and sets the accounts then displays the list (or handle various errors and redirects)
         *              - manual
         *                  - this will send us to the manual step via "showCountryFields()" a method that literally will show the required information for a given country
         *                    and not a selector for a country - but stuff like accountNumber, routingNumber, etc with the proper validation. If we call that function then we
         *                    will see the AddAccountNumbersManually view.
         *            - PlaidAccountList - let's us choose an account from the list if we went down the plaid road. We won't find any submit buttons in here since we are
         *                still working with our magical functions yay! There is a nextStep() function in here that will be called on submit. It does some stuff and then we
         *                call ReimbursementAccountPage.setupWithdrawlAccount().
         *
         * CompanyStep (React.v.CompanyStep)
         *     - Infinitely easier to understand here. There's just a form and no magic methods at all so you know that all we will do is call getFormValues() via FormInState
         *       mixin and then ReimbursementAccountPage.nextStep(). The only catch here is that there could be some validate() methods in FormInState which might not be obvious.
         *
         * RequestorStep (React.v.RequestorStep)
         *     - This one is slightly tricky as well since we will only show the Onfido SDK junk if we have a token and we only get a token when we call VerificationAPI::verify()
         *       with the RequestorStep and the first time we do that is when the user goes through React.v.GetRequestorIdentity
         *     - So, here's the whole flow broken down:
         *         - GetRequestorIdentity - User fills out the React.v.IdentityForm and GetRequestorIdentity.nextStep() is called on submit which does some validation stuff
         *               before calling ReimbursementAccountPage.nextStep() - this will ultimately hit ExpectID::verifyIDExists() and then return a bunch of questions (maybe)
         *         - AskRequestorIdentityQuestions - If we have questions in the response then we will have to answer them in this flow or we will use Onfido... I think...?
         *             This view cycles through questions/answers and then calls ReimbursementAccountPage.nextStep() again at the end.
         *         - Onfido SDK - this actually has no View in Web-Secure we just handle the callbacks from the SDK and once it's complete we
         *             call ReimbursementAccountPage.completeOnfido() - which basically just calls ReimbursementAccountPage.setupWithdrawalAccount() again with the onfidoData.
         *
         * ACHContractStep (React.v.BeneficialOwnersStep)
         *     - This is another easy one. Form values -> call nextStep() / validate -> ReimbursementAccountPage.nextStep()
         *
         * ValidationStep (React.v.ValidationStep)
         *     - This view is easy to understand as it basically looks at different things like achData.bankAccountInReview, achData.state === PENDING or state === OPEN.
         *     - Only if the account is PENDING do we asked the user to enter the 3 values then we call ReimbursementAccountPage.validateBankAccount() which is a separate
         *         API from setupWithdrawalAccount() but once we successfully validate we will call setupWithdrawalAccount() again viw nextStep()
         *     - The other two views will show messages and can't really be actioned on.
         *
         * EnableStep - We're killing this step so we don't need to worry about it. However, I think we might still need to handle it somehow in E.cash - but not entirely sure
         *     we'll find out more when testing.
         *
         * As for the whole this.achData thing if feels like the pattern of:
         *  - modififying the achData locally in the .then() of setupWithdrawalAccount() then "refreshing" the view
         *
         * Should be replaced with:
         *  - action called setupWithdrawalAccount() that modifies an achData key in Onyx and a larger view to render the correct steps and subscribe to this key in a dumb way
         */
        return (
            <ScreenWrapper>
                <View />
            </ScreenWrapper>
        );
    }
}

ReimbursementAccountPage.propTypes = propTypes;
ReimbursementAccountPage.defaultProps = defaultProps;
export default withOnyx({
    freePlanBankAccount: {
        key: ONYXKEYS.FREE_PLAN_BANK_ACCOUNT,
    },
    personalDetails: {
        key: ONYXKEYS.MY_PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },

    // @TODO we maybe need the user policyID + currency + default country + whether plaid is disabled ??
})(ReimbursementAccountPage);
