import type {View} from 'react-native';

// react-native-web reports `measure` from a timeout, after the browser has painted. The container briefly renders the input at one row to measure
// the content around it, so an async measurement lets that one-row frame reach the screen. Reading the height here keeps the whole measurement
// inside the layout effect, before paint. offsetHeight is the same value react-native-web's `measure` reports.
function measureAutoGrowContent(content: View | null, callback: (contentHeight: number) => void) {
    if (!(content instanceof HTMLElement)) {
        return;
    }
    callback(content.offsetHeight);
}

export default measureAutoGrowContent;
