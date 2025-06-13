import type {DetailedHTMLProps, IframeHTMLAttributes} from 'react';
import type {WebViewProps} from 'react-native-webview';

type EmbeddedDemoProps = {
    /** Embedded demo URL */
    url: string;

    /** **(web/desktop)** Description for screen readers */
    iframeTitle?: string;

    /** **(web/desktop)** Additional iframe props */
    iframeProps?: DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> & Record<string, unknown>;

    /** **(native)** Additional WebView props */
    webViewProps?: WebViewProps;
};

export default EmbeddedDemoProps;
