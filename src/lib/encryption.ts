import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static instance: EncryptionService;
  private key: string;

  private constructor() {
    // Use a combination of user ID and device-specific info as encryption key
    this.key = '';
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  public setEncryptionKey(userId: string) {
    // Create a unique key based on user ID and optional additional factors
    this.key = CryptoJS.SHA256(userId).toString();
  }

  public encrypt(text: string): string {
    if (!this.key) {
      throw new Error('Encryption key not set');
    }
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }

  public decrypt(encryptedText: string): string {
    if (!this.key) {
      throw new Error('Encryption key not set');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public generateEntryKey(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
}
