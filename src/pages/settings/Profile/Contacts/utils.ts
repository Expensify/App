import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import CONST from '@src/CONST';

/**
 * Decodes the contact method from the route params
 */
function getDecodedContactMethodFromUriParam(contactMethodParam: string) {
    // We find the number of times the url is encoded based on the last % sign and remove them.
    const lastPercentIndex = contactMethodParam.lastIndexOf('%');
    const encodePercents = contactMethodParam.substring(lastPercentIndex).match(/25/g);
    let numberEncodePercents = encodePercents?.length ?? 0;
    const beforeAtSign = contactMethodParam.substring(0, lastPercentIndex).replaceAll(CONST.REGEX.ENCODE_PERCENT_CHARACTER, (match) => {
        if (numberEncodePercents > 0) {
            numberEncodePercents--;
            return '%';
        }
        return match;
    });
    const afterAtSign = contactMethodParam.substring(lastPercentIndex).replaceAll(CONST.REGEX.ENCODE_PERCENT_CHARACTER, '%');

    return addSMSDomainIfPhoneNumber(decodeURIComponent(beforeAtSign + afterAtSign));
}

export default getDecodedContactMethodFromUriParam;
