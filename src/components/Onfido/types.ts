import type {OnfidoResult} from '@onfido/react-native-sdk';
import type {Handle} from 'onfido-sdk-ui/types/Onfido';
import type {CompleteData} from 'onfido-sdk-ui/types/shared/SdkParameters';
import type {ForwardedRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

type OnfidoData = CompleteData | OnfidoResult;

type OnfidoDataWithApplicantID = OnfidoData & {
    applicantID: OnyxEntry<string>;
};

type OnfidoElement = HTMLDivElement & {onfidoOut?: Handle};

type OnfidoProps = {
    /** Token used to initialize the Onfido SDK */
    sdkToken: string;

    /** Called when the user exits the flow without completing it */
    onUserExit: (isUserInitiated?: boolean) => void;

    /** Called when the user is totally done with Onfido */
    onSuccess: (data: OnfidoData) => void;

    /** Called when Onfido throws an error */
    onError: (error?: string) => void;

    /** Reference to the outer element */
    ref?: ForwardedRef<OnfidoElement>;
};

type OnfidoError = Error & {
    type?: string;
};

export type {OnfidoProps, OnfidoElement, OnfidoData, OnfidoDataWithApplicantID, OnfidoError};
