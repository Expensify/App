import type {HybridObject} from 'react-native-nitro-modules';

/** A connection that native certificate pinning refused because the server's chain matched none of our pins. */
type BlockedConnection = {
    /** Host the app tried to reach, e.g. www.expensify.com */
    host: string;

    /**
     * Subject of the root certificate that anchored the served chain, when the native layer knows it
     * (e.g. "Zscaler Root CA"). It names the proxy or filter that intercepted the connection.
     */
    rootCertificateName?: string;
};

/**
 * Forwards connections blocked by certificate pinning from native code to JS.
 *
 * Pinning runs in several native stacks that do not depend on each other (TrustKit and the OkHttp,
 * HttpURLConnection and Cronet clients, in both the App and Mobile-Expensify). Each of them announces
 * a blocked connection with an in-process signal named in config/certificatePinning/README.md, and
 * this module is the only listener. Signals are sent only in enforce mode, when a request really fails.
 */
interface CertificatePinningModule extends HybridObject<{
    ios: 'swift';
    android: 'kotlin';
}> {
    /** Starts forwarding blocked connections to the listener. A new listener replaces the previous one. */
    setConnectionBlockedListener(listener: (connection: BlockedConnection) => void): void;

    /** Stops forwarding blocked connections. */
    removeConnectionBlockedListener(): void;
}

export default CertificatePinningModule;
export type {BlockedConnection};
