import * as API from '../API';

function fetchBankAccountList() {
    // Note: For the moment, we are just running this to verify that we can successfully return data from the secure API
    API.Get({returnValueList: 'bankAccountList'}, true);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    fetchBankAccountList,
};
