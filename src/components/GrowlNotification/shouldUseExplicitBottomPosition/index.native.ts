import type {GrowlPosition} from '@libs/Growl';

const shouldUseExplicitBottomPosition: (position?: GrowlPosition) => boolean = () => false;

export default shouldUseExplicitBottomPosition;
