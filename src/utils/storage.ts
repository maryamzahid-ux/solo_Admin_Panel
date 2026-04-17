export const secureSetItem = (key: string, value: any) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    // Obfuscate the string using base64 encoding
    // This stops casual inspection but isn't true cryptographic encryption.
    // If true AES encryption is needed later, this wrapper can be upgraded using crypto-js.
    const obfuscated = btoa(encodeURIComponent(stringValue));
    localStorage.setItem(key, obfuscated);
  } catch (error) {
    console.error(`Error securely saving ${key} to localStorage:`, error);
  }
};

export const secureGetItem = (key: string) => {
  try {
    const obfuscated = localStorage.getItem(key);
    if (!obfuscated) return null;

    const decodedString = decodeURIComponent(atob(obfuscated));

    // Attempt to parse as JSON, otherwise return the raw string (e.g. for simple tokens)
    try {
      return JSON.parse(decodedString);
    } catch {
      return decodedString;
    }
  } catch (error) {
    console.error(`Error reading ${key} from secure localStorage:`, error);
    return null;
  }
};

export const secureRemoveItem = (key: string) => {
  localStorage.removeItem(key);
};
