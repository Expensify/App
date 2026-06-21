import {useContent} from './ContentContext';

function useClose(): () => void {
    return useContent('useClose').actions.close;
}

export default useClose;
