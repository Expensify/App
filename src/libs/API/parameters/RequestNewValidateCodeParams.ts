import type ResendValidateCodeParams from './ResendValidateCodeParams';

type RequestNewValidateCodeParams = {
    email?: string;
    deviceInfo: string;
} & ResendValidateCodeParams;

export default RequestNewValidateCodeParams;
