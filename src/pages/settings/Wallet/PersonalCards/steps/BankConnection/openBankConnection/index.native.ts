import {Linking} from 'react-native';

const handleOpenBankConnectionFlow = (url: string) => {
    Linking.openURL(url);
    return null;
};

export default handleOpenBankConnectionFlow;
