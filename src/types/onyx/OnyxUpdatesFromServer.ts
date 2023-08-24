import { OnyxUpdate } from "react-native-onyx";
import Request from "./Request";
import Response from "./Response";


type OnyxUpdatesFromServerData = {
    request?: Request;
    response?: Response;
    updates?: OnyxUpdate[];
}


type OnyxUpdatesFromServer = {
    lastUpdateID: number;
    previousUpdateID: number;
    type: 'https' | 'pusher'
    data: OnyxUpdatesFromServerData
};

export default OnyxUpdatesFromServer;