import {writable, type Writable} from "svelte/store";

export function storable<T>(localStorageKey: string, initial: T): Writable<T> {
    // @ts-ignore
    if (typeof storable.usedKeys == 'undefined') {
        // It has not... perform the initialization
        // @ts-ignore
        storable.usedKeys = [];
    }
    // @ts-ignore
    // if (storable.usedKeys.includes(localStorageKey)) {
    //     console.log('Err: cannot use the same key')
    // }
    // // @ts-ignore
    // storable.usedKeys.push(localStorageKey);
    let initial_value = initial;
    try {
        initial_value = JSON.parse(localStorage[localStorageKey] ? localStorage[localStorageKey] : JSON.stringify(initial));
    } catch (e) {
        console.log('Could not parse initial value of ' + localStorageKey + ' as JSON')
    }
    const ret = writable(initial_value);
    ret.subscribe((value) => localStorage.setItem(localStorageKey, JSON.stringify(value)))
    return ret;
}