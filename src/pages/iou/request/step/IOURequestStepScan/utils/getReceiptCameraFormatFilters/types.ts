import type {FormatFilter} from 'react-native-vision-camera';

type GetReceiptCameraFormatFiltersParams = {
    windowWidth: number;
    windowHeight: number;
};

type GetReceiptCameraFormatFilters = (params: GetReceiptCameraFormatFiltersParams) => FormatFilter[];

export default GetReceiptCameraFormatFilters;
