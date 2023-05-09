import {Pressable} from 'react-native';

const style = {
    margin: 10,
    padding: 2,
};

const ButtonBase = ({onPress, icon}) => (
    <Pressable onPress={onPress} style={style}>
        {icon}
    </Pressable>
);

ButtonBase.displayName = 'ButtonBase';

export default ButtonBase;
