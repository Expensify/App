import type {OnfidoResult} from '@onfido/react-native-sdk';
import type * as OnfidoSDK from 'onfido-sdk-ui';

type OnfidoData = OnfidoSDK.SdkResponse | OnfidoResult;

type OnfidoElement = HTMLDivElement & {onfidoOut?: OnfidoSDK.SdkHandle};

type OnfidoProps = {
    /** Token used to initialize the Onfido SDK */
    sdkToken: string;

    /** Called when the user intentionally exits the flow without completing it */
    onUserExit: (userExitCode?: OnfidoSDK.UserExitCode) => void;

    /** Called when the user is totally done with Onfido */
    onSuccess: (data: OnfidoData) => void;

    /** Called when Onfido throws an error */
    onError: (error?: string) => void;
};

export type {OnfidoProps, OnfidoElement, OnfidoData};
