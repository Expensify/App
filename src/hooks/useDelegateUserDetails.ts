import { useOnyx } from "react-native-onyx";
import useCurrentUserPersonalDetails from "./useCurrentUserPersonalDetails";
import ONYXKEYS from "@src/ONYXKEYS";
import AccountUtils from "@libs/AccountUtils";

function useDelegateUserDetails() {
    const currentUserDeatils = useCurrentUserPersonalDetails();
    const [currentUserAccountDetails] = useOnyx(ONYXKEYS.ACCOUNT);
    const isDelegatorAccessRestricted = AccountUtils.isDelegateOnlySubmitter(currentUserAccountDetails);

    return {
        isDelegatorAccessRestricted,
        currentUserDeatils,
    };
}

export default useDelegateUserDetails;