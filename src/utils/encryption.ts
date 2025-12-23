import bcrypt from "bcryptjs";

/**
 * Hash password/code menggunakan bcrypt
 */
export const hashCode = async (code: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(code, salt);
  return hashed;
};

/**
 * Verify code dengan hash
 */
export const verifyCode = async (
  code: string,
  hashedCode: string
): Promise<boolean> => {
  return await bcrypt.compare(code, hashedCode);
};

/**
 * Encode data menjadi string terenkripsi (Base64)
 */
export const encodeData = (
  message: string,
  code: string,
  footprint: any
): string => {
  try {
    const data = {
      message: message,
      code: code,
      footprint: footprint
    };

    const jsonString = JSON.stringify(data);
    const encoded = btoa(encodeURIComponent(jsonString));

    return encoded;
  } catch (error) {
    throw new Error(
      `Encode error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Decode string terenkripsi menjadi data asli
 */
export const decodeData = (encryptedData: string): { message: string; code: string; footprint: any } => {
  try {
    const decoded = decodeURIComponent(atob(encryptedData));
    const data = JSON.parse(decoded);
    
    return {
      message: data.message || '',
      code: data.code || '',
      footprint: data.footprint || {}
    };
  } catch (error) {
    throw new Error(`Decode error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Encrypt message dengan code
 */
export const encryptMessage = (message: string, code: string): string => {
  try {
    // Simple XOR encryption with code
    let encrypted = '';
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i) ^ code.charCodeAt(i % code.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encodeURIComponent(encrypted));
  } catch (error) {
    throw new Error(`Encryption error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Decrypt message dengan code
 */
export const decryptMessage = (encryptedMessage: string, code: string): string => {
  try {
    const decoded = decodeURIComponent(atob(encryptedMessage));
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ code.charCodeAt(i % code.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};