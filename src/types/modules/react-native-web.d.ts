declare module 'react-native-web' {
    type SetString = (text: string) => void;
    
    const Clipboard: {
        setString: SetString;
    }
}