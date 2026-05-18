import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

function openHelpPage() {
    API.read(READ_COMMANDS.GET_ASSIGNED_SUPPORT_DATA, null);
}

// eslint-disable-next-line import/prefer-default-export
export {openHelpPage};
