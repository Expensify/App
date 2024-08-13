function getDefaultCompanyWebsite(): string {
    // return user?.isFromPublicDomain ? 'https://' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`;
    // temporarily always returns https:// to fix https://github.com/Expensify/App/issues/47227 until https://github.com/Expensify/App/issues/45278 is resolved.
    return 'https://';
}

function getLastFourDigits(bankAccountNumber: string): string {
    return bankAccountNumber ? bankAccountNumber.slice(-4) : '';
}

export {getDefaultCompanyWebsite, getLastFourDigits};
