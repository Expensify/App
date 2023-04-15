import {Pressable} from 'react-native';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';

// Circular button that will contain a logo, used as base for Google and Apple Sign-In buttons

const ButtonBase = ({onPress, icon}) => (
    <Pressable onPress={onPress} style={style}>
        {icon}
        <Icon src={Expensicons.ImageCropCircleMask} width={40} height={40} additionalStyles={[styles.pAbsolute]} />
    </Pressable>
);

const style = {
    background: 'white',
    height: 40,
    width: 40,
    margin: 10,
    padding: 0,
    backgroundColor: 'purple',
};

const maskStyle = {
    ...styles.pAbsolute,
};

export default ButtonBase;
