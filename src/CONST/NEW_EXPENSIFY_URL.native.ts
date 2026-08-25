import addTrailingForwardSlash from '@libs/UrlUtils';

import Config from 'react-native-config';

import DEFAULT_NEW_EXPENSIFY_URL from './DEFAULT_NEW_EXPENSIFY_URL';

const NEW_EXPENSIFY_URL = addTrailingForwardSlash(Config?.NEW_EXPENSIFY_URL ?? DEFAULT_NEW_EXPENSIFY_URL);

export default NEW_EXPENSIFY_URL;
