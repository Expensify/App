import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';

/**
 * Gets the contact method from the route params. The router already decodes path params once,
 * so decoding again here would throw on a literal `%` (e.g. `test%alias@gmail.com`) or alter valid escapes.
 */
function getDecodedContactMethodFromUriParam(contactMethodParam: string) {
    return addSMSDomainIfPhoneNumber(contactMethodParam);
}

export default getDecodedContactMethodFromUriParam;
