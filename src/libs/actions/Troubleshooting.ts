import Onyx from 'react-native-onyx';

function exportOnyxDataToFile() {
    Onyx.getAllEntries().then((entries) => JSON.stringify(entries));
}

export default {
    exportOnyxDataToFile,
};
