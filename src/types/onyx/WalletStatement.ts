/** Model of wallet statement */
type WalletStatement = {
    /** Whether we are currently generating a PDF version of the statement */
    isGenerating: boolean;

    /** 
      yearMonth - key with filename as value, boolean value added for isGenerating key
     */
    [yearMonth: string]: string | boolean;
};

export default WalletStatement;
