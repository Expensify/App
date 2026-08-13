import {screen} from '@testing-library/react-native';

// testing-library/no-debugging-utils: debug() left in a test
function probe() {
    screen.debug();
}

export default probe;
