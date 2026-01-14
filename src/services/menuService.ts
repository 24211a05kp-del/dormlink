import { db } from "../firebase/config";
import { collection, doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

export interface DayMenu {
    breakfast: string[];
    lunch: string[];
    snacks: string[];
    dinner: string[];
}

export interface WeeklyMenu {
    [key: string]: DayMenu;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const initialWeeklyMenu: WeeklyMenu = {
    Sunday: {
        breakfast: ['Puri / Dosa'],
        lunch: ['White rice', 'Mudha pappu', 'Avakaya', 'Bendakaya oil fry', 'Sambar / Rasam', 'Papad', 'Curd'],
        snacks: ['Fruits', 'Chai', 'Coffee'],
        dinner: ['Bagara rice', 'White rice', 'Chicken curry', 'Paneer curry', 'Sambar', 'Raita', 'Gravy', 'Kaala jamun']
    },
    Monday: {
        breakfast: ['Ravva bonda / Poha', 'Tea', 'Milk'],
        lunch: ['Pudina rice', 'White rice', 'Vankaya curry', 'Sorakaya dum fry', 'Tomato pappu', 'Miryala rasam', 'Cabbage chutney', 'Curd', 'Chips'],
        snacks: ['Puffs', 'Chai', 'Coffee'],
        dinner: ['Chapathi', 'White rice', 'Aloo tomato curry', 'Sambar', 'Cabbage oil fry', 'Chutney', 'Curd', 'Banana']
    },
    Tuesday: {
        breakfast: ['Chapathi', 'Pesara pappu', 'Tea', 'Milk'],
        lunch: ['Kothimeera rice', 'White rice', 'Dondakaya curry', 'Aloo popu', 'Beerakaya pappu', 'Tomato rasam', 'Dosakaya chutney', 'Curd', 'Chips'],
        snacks: ['Punugulu', 'Chai', 'Coffee'],
        dinner: ['White rice', 'Boiled egg', 'Tomato curry (veg & non-veg)', 'Sambar', 'Chutney', 'Gravy', 'Badusha', 'Curd']
    },
    Wednesday: {
        breakfast: ['Idly', 'Palli chutney', 'Sambar', 'Tea', 'Milk'],
        lunch: ['Carrot rice', 'White rice', 'Bendakaya curry', 'Paalakura pappu', 'Cabbage dum fry', 'Dondakaya chutney', 'Dhanyala rasam', 'Curd', 'Chips'],
        snacks: ['Pakodi', 'Chai', 'Coffee'],
        dinner: ['Bagara rice', 'White rice', 'Chicken curry', 'Paneer curry', 'Sambar', 'Raita', 'Gravy', 'Semya payasam / Ravva kesari']
    },
    Thursday: {
        breakfast: ['Mysore bonda / Vada', 'Palli chutney / Allam chutney', 'Sambar', 'Tea', 'Milk'],
        lunch: ['Jeera rice', 'White rice', 'Chikkudukaya curry', 'Sorakaya pappu', 'Beetroot deep fry', 'Pappu chaaru', 'Cabbage chutney', 'Curd', 'Chips'],
        snacks: ['Noodles', 'Chai', 'Coffee'],
        dinner: ['Chapathi', 'White rice', 'Chole masala curry', 'Sambar', 'Chutney', 'Aloo 65', 'Curd', 'Banana']
    },
    Friday: {
        breakfast: ['Chinthapandu pulihora / Tomato rice', 'Tea', 'Milk'],
        lunch: ['Karivepaku rice', 'White rice', 'Tomato curry', 'Dosakaya pappu', 'Sambar', 'Cabbage dum fry', 'Sorakaya chutney', 'Curd', 'Chips'],
        snacks: ['Sponge cake', 'Chai', 'Coffee'],
        dinner: ['Chapathi', 'White rice', 'Egg burji', 'Mixed veg curry', 'Chutney', 'Sambar', 'Curd']
    },
    Saturday: {
        breakfast: ['Idly', 'Bread jam / Omelette', 'Palli chutney', 'Sambar', 'Tea', 'Milk'],
        lunch: ['Pulihora', 'White rice', 'Gori chikkudukaya curry', 'Tomato pappu', 'Sorakaya dum fry', 'Perugu pulusu', 'Beerakaya chutney', 'Rasam', 'Curd', 'Chips'],
        snacks: ['Samosa', 'Chai', 'Coffee'],
        dinner: ['White rice', 'Capsicum masala', 'Sorakaya 65', 'Sambar', 'Chutney', 'Curd', 'Banana']
    }
};

export const menuService = {
    // Initialize DB with default menu if empty
    initialize: async () => {
        try {
            const checkDoc = await getDoc(doc(db, "dailyMenus", "Monday"));
            if (!checkDoc.exists()) {
                console.log("Initializing Menu in Firestore...");
                for (const day of DAYS) {
                    if (initialWeeklyMenu[day]) {
                        await setDoc(doc(db, "dailyMenus", day), initialWeeklyMenu[day]);
                    }
                }
            }
        } catch (error) {
            console.error("Firestore Error (menuService.initialize):", error);
        }
    },

    // Subscribe to real-time menu updates
    subscribeToMenu: (callback: (menu: WeeklyMenu) => void) => {
        return onSnapshot(collection(db, "dailyMenus"), (snapshot) => {
            const menuData: WeeklyMenu = {};
            snapshot.docs.forEach(doc => {
                menuData[doc.id] = doc.data() as DayMenu;
            });
            // Ensure all days are present even if DB is partial (fallback)
            DAYS.forEach(day => {
                if (!menuData[day]) {
                    // Fallback to initial if specific day missing
                    menuData[day] = initialWeeklyMenu[day] || { breakfast: [], lunch: [], snacks: [], dinner: [] };
                }
            });
            callback(menuData);
        });
    },

    // Update specific day's menu
    updateDayMenu: async (day: string, menu: DayMenu) => {
        await updateDoc(doc(db, "dailyMenus", day), menu as any);
    }
};
