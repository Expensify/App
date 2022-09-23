import CONFIG from '../../CONFIG';
import * as Client from './client';

const isE2ETestSession = () => CONFIG.E2E_TESTING;

const setup = () => {
    if (!isE2ETestSession()) {
        return;
    }
    Client.listenForServerCommands();
};

export {isE2ETestSession, setup};
