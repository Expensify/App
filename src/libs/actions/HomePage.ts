import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

/** Fetches the Home data that can change after the app has loaded, such as the early renewal offer. */
function openHomePage() {
    read(READ_COMMANDS.OPEN_HOME_PAGE, null);
}

export default openHomePage;
