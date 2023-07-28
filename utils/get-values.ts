export const getObjectValue = <T, X>(object: T, key: X) => {
    // get the value of the key
    if (typeof object === 'object' && object !== null) {
        // @ts-ignore
        const foundKey = object[key];

        if (foundKey) {
            return foundKey;
        } else {
            return null;
        }
    }
}
