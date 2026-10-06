import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Session tokens live in the OS keystore (Android Keystore / iOS Keychain) via
 * expo-secure-store. Passwords are never persisted anywhere.
 *
 * On web (dev preview only) SecureStore is unavailable, so tokens are kept in
 * memory for the lifetime of the tab.
 */

const ACCESS_KEY = 'ib_access_token';
const REFRESH_KEY = 'ib_refresh_token';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const memory: Partial<Record<string, string>> = {};
const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string) {
  if (isWeb) {
    memory[key] = value;
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return memory[key] ?? null;
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (isWeb) {
    delete memory[key];
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async save(tokens: Tokens) {
    await Promise.all([setItem(ACCESS_KEY, tokens.accessToken), setItem(REFRESH_KEY, tokens.refreshToken)]);
  },
  async load(): Promise<Tokens | null> {
    const [accessToken, refreshToken] = await Promise.all([getItem(ACCESS_KEY), getItem(REFRESH_KEY)]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },
  async clear() {
    await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY)]);
  },
};
