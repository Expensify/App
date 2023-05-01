import {Pressable, View} from 'react-native';
import variables from '../../styles/variables';

// Circular button that will contain a logo, used as base for Google and Apple Sign-In buttons

const ButtonBase = ({onPress, icon}) => (
    <Pressable onPress={onPress} style={{margin: 10}}>
        <View style={style}>
            {icon}
        </View>
    </Pressable >
);

const style = {
    alignItems: 'center',
    justifyContent: 'center',
    height: variables.iconSizeExtraLarge,
    width: variables.iconSizeExtraLarge,
    borderRadius: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
};

ButtonBase.displayName = 'ButtonBase';

export default ButtonBase;
