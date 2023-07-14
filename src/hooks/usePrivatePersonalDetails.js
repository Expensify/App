import {useContext} from "react";
import {PrivatePersonalDetailsContext} from "../components/withPrivatePersonalDetails";

/**
 * Hook for fetching private personal details
 * @returns {Object}
 */
export default function usePrivatePersonalDetails() {
    return useContext(PrivatePersonalDetailsContext);
}
