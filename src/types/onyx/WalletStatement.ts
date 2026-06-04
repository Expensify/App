/** Model of wallet statement — maps yearMonth keys (YYYYMM) to generated PDF filenames */
type WalletStatement = Record<string, string>;

export default WalletStatement;
