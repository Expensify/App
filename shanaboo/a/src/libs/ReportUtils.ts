import {format} from 'date-fns';
import {parse} from 'expensify-common';
import {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
 */
function getTaskDescription(report: OnyxEntry<Report>): string {
    const description = report?.description ?? '';
    const parsedDescription = parse(description, {textRepresentation: 'text'});
    return parsedDescription;
}

/**