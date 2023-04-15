import {Pressable, Text} from 'react-native';

// Circular button that will contain a logo, used as base for Google and Apple Sign-In buttons

const ButtonBase = ({onPress, icon}) => <Pressable onPress={onPress} style={style}>{icon}</Pressable>;

const style = {
    background: 'white',
    borderRadius: 50,
};

export default ButtonBase;
