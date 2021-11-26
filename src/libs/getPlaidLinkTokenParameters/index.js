import ROUTES from "../../ROUTES";
import {removeTrailingForwardSlash} from "../Url";
import CONST from "../../CONST";

export default () => {
    const bankAccountRoute = window.location.href.includes('personal') ? ROUTES.BANK_ACCOUNT_PERSONAL : removeTrailingForwardSlash(ROUTES.getBankAccountRoute());
    return {redirect_uri: `${CONST.NEW_EXPENSIFY_URL}/${bankAccountRoute}`};
};
