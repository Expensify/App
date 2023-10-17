import SwipeableViewComponent from './types';

// Swipeable View is available just on Android/iOS for now.
const SwipeableView: SwipeableViewComponent = ({children}) => children;

SwipeableView.displayName = 'SwipeableView';

export default SwipeableView;
