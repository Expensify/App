// This is required in order for jest to recognize custom matchers like toBeDisabled. This can be removed once testing-library/react-native version is bumped to v12.4 or later
import '@testing-library/jest-native/extend-expect';

jest.useRealTimers();
