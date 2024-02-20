import {useState} from 'react';

function useConstructor(callBack: () => void) {
    const [hasBeenCalled, setHasBeenCalled] = useState(false);
    if (hasBeenCalled) return;

    setHasBeenCalled(true);
    callBack();
};

export default useConstructor;
