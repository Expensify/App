import type {InteractionManager} from 'react-native';

type DoInteractionTask = (callback: () => void) => ReturnType<typeof InteractionManager.runAfterInteractions> | null;

export default DoInteractionTask;
