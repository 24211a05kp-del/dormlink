import { db } from "../firebase/config";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export interface AppSettings {
    maxGuardians: number;
}

const DEFAULT_SETTINGS: AppSettings = {
    maxGuardians: 3
};

export const settingsService = {
    getSettings: async (): Promise<AppSettings> => {
        const docRef = doc(db, "app_settings", "global");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as AppSettings;
        } else {
            // Initialize with defaults if not exists
            await setDoc(docRef, DEFAULT_SETTINGS);
            return DEFAULT_SETTINGS;
        }
    },

    updateSettings: async (settings: Partial<AppSettings>) => {
        const docRef = doc(db, "app_settings", "global");
        await setDoc(docRef, settings, { merge: true });
    },

    subscribeToSettings: (callback: (settings: AppSettings) => void) => {
        const docRef = doc(db, "app_settings", "global");
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as AppSettings);
            } else {
                callback(DEFAULT_SETTINGS);
            }
        });
    }
};
