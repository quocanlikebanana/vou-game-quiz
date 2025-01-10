function removeNullValues<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== null)
    ) as Partial<T>;
}

// Deep check. Aware for circular references.
function checkAllPropertiesNotNull(obj: object): boolean {
    return Object.values(obj).every(value => {
        debugger;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (value.constructor.name === 'Object') {
                return checkAllPropertiesNotNull(value);
            }
        }
        return value != null;
    });
}

function shallowEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
        return true;
    }
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}

export {
    removeNullValues,
    checkAllPropertiesNotNull,
    shallowEqual,
};