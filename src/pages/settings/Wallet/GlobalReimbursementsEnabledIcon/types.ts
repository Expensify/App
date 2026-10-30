import type {GestureResponderEvent} from 'react-native';

type GlobalReimbursementsEnabledIconProps = {
    /** Called on a tap on native, where the icon catches the touch, so it can act like a tap on the row it sits in */
    onPress?: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;
};

export default GlobalReimbursementsEnabledIconProps;
