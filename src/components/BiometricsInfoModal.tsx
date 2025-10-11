import styles from '@/styles';
import {Text, TouchableOpacity, View} from 'react-native';

type BiometricsInfoModalProps = {
    onClose?: () => void;
    title?: string;
    message?: string;
    success?: boolean;
};

function BiometricsInfoModal({success = true, title, message, onClose}: BiometricsInfoModalProps) {
    return (
        <View style={styles.callbackContainer}>
            <View style={styles.gap15}>
                <Text style={styles.hugeText}>{title}</Text>
                <Text>{message}</Text>
            </View>
            <TouchableOpacity
                style={success ? styles.greenButton : styles.buttonNegative}
                onPress={onClose}
            >
                <Text style={success ? styles.greenButtonText : styles.buttonTextNegative}>Got it</Text>
            </TouchableOpacity>
        </View>
    );
}

BiometricsInfoModal.displayName = 'BiometricsInfoModal';

export default BiometricsInfoModal;
