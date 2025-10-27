function getFirstAlphaNumericCharacter(str = '') {
    return (
        str
            .normalize('NFD')
            .replace(/[^0-9a-z]/gi, '')
            .toUpperCase()[0] ?? ''
    );
}

export default getFirstAlphaNumericCharacter;
