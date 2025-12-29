import '@testing-library/react-native';
import IntlStore from '@src/languages/IntlStore';

// Initialize IntlStore with EN translations for tests
IntlStore.init();
IntlStore.load('en');

jest.useRealTimers();
