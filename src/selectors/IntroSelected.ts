import type {OnyxEntry} from 'react-native-onyx';
import type IntroSelected from '@src/types/onyx/IntroSelected';

const hasIntroSelectedSelector = (introSelected: OnyxEntry<IntroSelected>) => !!introSelected?.choice;

export default hasIntroSelectedSelector;
