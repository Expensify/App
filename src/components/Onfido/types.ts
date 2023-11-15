import {OnfidoError, OnfidoResult} from '@onfido/react-native-sdk';
import * as OnfidoSDK from 'onfido-sdk-ui';

type OnfidoElement = HTMLDivElement & {onfidoOut?: OnfidoSDK.SdkHandle};

type OnfidoProps = {
    /** Token used to initialize the Onfido SDK */
    sdkToken: string;

    /** Called when the user intentionally exits the flow without completing it */
    onUserExit: (userExitCode?: OnfidoSDK.UserExitCode) => void;

    /** Called when the user is totally done with Onfido */
    onSuccess: (data: OnfidoSDK.SdkResponse | OnfidoResult | OnfidoError) => void;

    /** Called when Onfido throws an error */
    onError: (error?: string) => void;
};

export type {OnfidoProps, OnfidoElement};
