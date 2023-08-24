import { OnyxUpdate } from "react-native-onyx";
import Request from "./Request";
import Response from "./Response";


type OnyxUpdateFromServerData = {
    request?: Request;
    response?: Response;
    updates?: OnyxUpdate[];
}


type OnyxUpdateFromServer = {
    lastUpdateID: number;
    previousUpdateID: number;
    type: 'HTTPS' | 'PUSHER'
    data: OnyxUpdateFromServerData
};

export default OnyxUpdateFromServer;