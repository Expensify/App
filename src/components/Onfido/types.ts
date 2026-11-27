import type CONST from '@src/CONST';

import type {CompleteData} from 'onfido-sdk-ui/types/shared/SdkParameters';
import type {ForwardedRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

/**
 * The result shape the native Onfido SDK used to return. The Entrust IDV SDK that replaced it returns a different shape,
 * so we map its result back to this one to keep the payload sent to the backend unchanged.
 */
type NativeOnfidoResult = {
    document?: {
        front: {id: string};
        back?: {id: string};
    };
    face?: {
        id: string;
        variant: ValueOf<typeof CONST.ONFIDO.NATIVE_FACE_VARIANT>;
    };
};

type OnfidoData = CompleteData | NativeOnfidoResult;

type OnfidoDataWithApplicantID = OnfidoData & {
    applicantID: OnyxEntry<string>;
};

type OnfidoElement = HTMLDivElement;

type OnfidoProps = {
    /** Token used to initialize the Onfido SDK */
    sdkToken: string;

    /** Called when the user exits the flow without completing it */
    onUserExit: (isUserInitiated?: boolean) => void;

    /** Called when the user is totally done with Onfido */
    onSuccess: (data: OnfidoData) => void;

    /** Called when Onfido throws an error */
    onError: (error?: string) => void;

    ref?: ForwardedRef<OnfidoElement>;
};

export type {OnfidoProps, OnfidoElement, OnfidoData, OnfidoDataWithApplicantID, NativeOnfidoResult};
