import CryptoJS from 'crypto-js';

var secret_key = 'uI2ooxtwHeI6q69PS98fx9SWVGbpQohO';

export const to_Encrypt = (text) => {
  var encrypted = CryptoJS.AES.encrypt(text, secret_key).toString();
  return encrypted;
};
export const to_Decrypt = (cipher, username) => {
  if (cipher.startsWith('Welcome')) {
    return cipher;
  }

  if (cipher.startsWith(username)) {
    return cipher;
  }

  var decrypted = CryptoJS.AES.decrypt(cipher, secret_key);
  var originalText = decrypted.toString(CryptoJS.enc.Utf8);
  return originalText;
};
