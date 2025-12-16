import CONST from '@src/CONST';

/** Compares error keys and searches for overlap. Based on the result we decide whether to gather extra file
 * @param status - status of the check
 * @param qualifiers - errors returned after the check
 * @returns boolean - whether to gather additional DOB verification file
 */
function isUserDOBVerificationRequired(
    status: string | undefined,
    qualifiers:
        | Array<{
              key: string;
              message: string;
          }>
        | undefined,
): boolean {
    return status !== 'pass' && !!CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.DOB.find((error) => qualifiers?.map((qualifier) => qualifier.key).includes(error));
}

export default isUserDOBVerificationRequired;
