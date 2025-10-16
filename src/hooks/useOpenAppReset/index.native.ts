import {openApp} from '@libs/actions/App';

const useOpenAppReset = () => {
    return () => {
        openApp();
    };
};

export default useOpenAppReset;
