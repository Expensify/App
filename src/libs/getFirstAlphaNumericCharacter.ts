function getFirstAlphaNumericCharacter(str = '') {
    return (
        str
            .normalize('NFD')
            .replaceAll(/[^0-9a-z]/gi, '')
            .toUpperCase()[0] ?? ''
    );
}

export default getFirstAlphaNumericCharacter;
