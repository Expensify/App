import * as API from '../../API';
import BankAccountUtils from '../../BankAccountUtils';

/**
* Update the user's personal information on the bank account in database.
*
* This action is called by the requestor step in the Verified Bank Account flow
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
    API.write('UpdatePersonalInformationForBankAccount', params, BankAccountUtils.getVBBADataForOnyx());
}

export default updatePersonalInformationForBankAccount;
