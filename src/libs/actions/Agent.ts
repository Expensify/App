import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

function openAgentsPage() {
    read(READ_COMMANDS.OPEN_AGENTS_PAGE, null);
}

// eslint-disable-next-line import/prefer-default-export
export {openAgentsPage};
