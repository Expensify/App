import styles from '@/styles';
import {useState} from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';

type InputModalProps = {
    onSubmit: (validateCode: number) => void;
    title: string;
};

function BiometricsInputModal({onSubmit, title}: InputModalProps) {
    const [inputValue, setInputValue] = useState('');

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.hugeText}>{title}</Text>
            <View style={styles.innerInputContainer}>
                <TextInput
                    onChangeText={(text) => setInputValue(text)}
                    value={inputValue}
                    keyboardType="numeric"
                    inputMode="numeric"
                    maxLength={6}
                    style={styles.textInput}
                />
                <TouchableOpacity
                    style={styles.greenButton}
                    onPress={() => onSubmit(Number(inputValue))}
                >
                    <Text style={styles.greenButtonText}>Authorize</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

BiometricsInputModal.displayName = 'BiometricsInputModal';

export default BiometricsInputModal;
