import * as API from '../../API';
import * as BankAccounts from '../BankAccounts';

/**
* Create or update the bank account in db with the updated data.
*
* This action is called by several steps in the Verified Bank Account flow and is coupled tightly with SetupWithdrawalAccount in Auth
* Each time the command is called the state of the bank account progresses a bit further and when handling the response we redirect
* to the appropriate next step in the flow.
*
* @param {Object} params
*
* // RequestorStep
* @param {String} [params.dob]
* @param {String} [params.firstName]
* @param {String} [params.lastName]
* @param {String} [params.requestorAddressStreet]
* @param {String} [params.requestorAddressCity]
* @param {String} [params.requestorAddressState]
* @param {String} [params.requestorAddressZipCode]
* @param {String} [params.ssnLast4]
* @param {String} [params.isControllingOfficer]
* @param {Object} [params.onfidoData]
* @param {Boolean} [params.isOnfidoSetupComplete]
*/
function updatePersonalInformationForBankAccount(params) {
    API.write('UpdatePersonalInformationForBankAccount', params, BankAccounts.getVBBADataForOnyx());
}

export default updatePersonalInformationForBankAccount;
