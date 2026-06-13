import { create } from 'zustand';
import { db } from '../../firebase/config';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs, writeBatch 
} from 'firebase/firestore';
import { useAdminStore } from './useAdminStore';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string; // e.g. 'Kg', 'Liters', 'Pieces', 'Grams'
  minStock: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // needed for 1 portion
}

export interface RecipeMapping {
  id: string; // matches menuItemId
  menuItemId: string;
  ingredients: RecipeIngredient[];
}

export interface PurchaseRecord {
  id: string;
  ingredientId: string;
  supplierId: string;
  purchaseDate: string; // YYYY-MM-DD
  quantity: number;
  cost: number;
}

export interface InventoryLog {
  id: string;
  ingredientId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: 'purchase' | 'order_deduction' | 'waste' | 'manual_adjustment' | 'daily_usage';
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface ReorderRequest {
  id: string;
  ingredientId: string;
  quantity: number;
  supplierId: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  createdAt: number;
  approvedAt?: number;
}

interface InventoryState {
  ingredients: Ingredient[];
  suppliers: Supplier[];
  recipes: RecipeMapping[];
  purchases: PurchaseRecord[];
  logs: InventoryLog[];
  reorders: ReorderRequest[];
  
  // Loading states
  loaded: {
    ingredients: boolean;
    suppliers: boolean;
    recipes: boolean;
    purchases: boolean;
    logs: boolean;
    reorders: boolean;
  };

  // Actions
  listenToAll: () => (() => void);
  seedDemoData: () => Promise<void>;
  
  // Ingredient CRUD
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (id: string, updatedFields: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  
  // Supplier CRUD
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, updatedFields: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Recipe Mapping CRUD
  saveRecipe: (menuItemId: string, ingredients: RecipeIngredient[]) => Promise<void>;
  deleteRecipe: (menuItemId: string) => Promise<void>;
  
  // Purchases
  recordPurchase: (purchase: Omit<PurchaseRecord, 'id'>) => Promise<void>;
  
  // Adjustments & Logs
  adjustStock: (ingredientId: string, quantity: number, type: 'in' | 'out', reason: InventoryLog['reason']) => Promise<void>;
  
  // Reorders
  createReorderRequest: (ingredientId: string, quantity: number, supplierId: string) => Promise<void>;
  updateReorderStatus: (id: string, status: ReorderRequest['status']) => Promise<void>;
  approveReorder: (id: string, quantity: number, cost: number) => Promise<void>;

  // Automated Hook
  deductIngredientsForOrder: (items: { name: string; quantity: number }[]) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ingredients: [],
  suppliers: [],
  recipes: [],
  purchases: [],
  logs: [],
  reorders: [],
  loaded: {
    ingredients: false,
    suppliers: false,
    recipes: false,
    purchases: false,
    logs: false,
    reorders: false,
  },

  listenToAll: () => {
    const unsubscribes: (() => void)[] = [];

    // Ingredients listener
    unsubscribes.push(
      onSnapshot(collection(db, 'ingredients'), (snapshot) => {
        const list: Ingredient[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as Ingredient));
        list.sort((a, b) => a.name.localeCompare(b.name));
        set((state) => ({ 
          ingredients: list, 
          loaded: { ...state.loaded, ingredients: true } 
        }));
      })
    );

    // Suppliers listener
    unsubscribes.push(
      onSnapshot(collection(db, 'suppliers'), (snapshot) => {
        const list: Supplier[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as Supplier));
        list.sort((a, b) => a.name.localeCompare(b.name));
        set((state) => ({ 
          suppliers: list, 
          loaded: { ...state.loaded, suppliers: true } 
        }));
      })
    );

    // Recipes listener
    unsubscribes.push(
      onSnapshot(collection(db, 'recipes'), (snapshot) => {
        const list: RecipeMapping[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as RecipeMapping));
        set((state) => ({ 
          recipes: list, 
          loaded: { ...state.loaded, recipes: true } 
        }));
      })
    );

    // Purchases listener
    unsubscribes.push(
      onSnapshot(collection(db, 'purchases'), (snapshot) => {
        const list: PurchaseRecord[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as PurchaseRecord));
        list.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
        set((state) => ({ 
          purchases: list, 
          loaded: { ...state.loaded, purchases: true } 
        }));
      })
    );

    // Logs listener
    unsubscribes.push(
      onSnapshot(collection(db, 'inventoryLogs'), (snapshot) => {
        const list: InventoryLog[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as InventoryLog));
        list.sort((a, b) => b.timestamp - a.timestamp);
        set((state) => ({ 
          logs: list, 
          loaded: { ...state.loaded, logs: true } 
        }));
      })
    );

    // Reorders listener
    unsubscribes.push(
      onSnapshot(collection(db, 'reorderRequests'), (snapshot) => {
        const list: ReorderRequest[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as ReorderRequest));
        list.sort((a, b) => b.createdAt - a.createdAt);
        set((state) => ({ 
          reorders: list, 
          loaded: { ...state.loaded, reorders: true } 
        }));
      })
    );

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  },

  seedDemoData: async () => {
    try {
      const batch = writeBatch(db);

      // Seed Suppliers
      const demoSuppliers: Supplier[] = [
        { id: 'S-01', name: 'Fresh Farms Produce', phone: '+91 98765 43210', address: '12 Market St, Block C', area: 'Green Ville' },
        { id: 'S-02', name: 'Dairy & Co.', phone: '+91 99887 76655', address: '88 Milky Way Blvd', area: 'North Cantonment' },
        { id: 'S-03', name: 'Pantry Depot', phone: '+91 91234 56789', address: 'B-4 Industrial Area Phase II', area: 'Industrial Zone' }
      ];
      demoSuppliers.forEach(s => {
        batch.set(doc(db, 'suppliers', s.id), s);
      });

      // Seed Ingredients
      const demoIngredients: Ingredient[] = [
        { id: 'I-01', name: 'Tomato', quantity: 45.0, unit: 'Kg', minStock: 15.0, supplierId: 'S-01' },
        { id: 'I-02', name: 'Onion', quantity: 50.0, unit: 'Kg', minStock: 20.0, supplierId: 'S-01' },
        { id: 'I-03', name: 'Chicken Breast', quantity: 35.0, unit: 'Kg', minStock: 10.0, supplierId: 'S-03' },
        { id: 'I-04', name: 'Milk', quantity: 30.0, unit: 'Liters', minStock: 12.0, supplierId: 'S-02' },
        { id: 'I-05', name: 'Butter', quantity: 18.0, unit: 'Kg', minStock: 6.0, supplierId: 'S-02' },
        { id: 'I-06', name: 'Pizza Dough', quantity: 60.0, unit: 'Pieces', minStock: 20.0, supplierId: 'S-03' },
        { id: 'I-07', name: 'Mozzarella Cheese', quantity: 24.0, unit: 'Kg', minStock: 8.0, supplierId: 'S-02' },
        { id: 'I-08', name: 'Coffee Beans', quantity: 12.0, unit: 'Kg', minStock: 4.0, supplierId: 'S-03' },
        { id: 'I-09', name: 'Romaine Lettuce', quantity: 3.5, unit: 'Kg', minStock: 8.0, supplierId: 'S-01' }, // Low stock initially!
        { id: 'I-10', name: 'Fresh Salmon fillet', quantity: 4.0, unit: 'Kg', minStock: 7.0, supplierId: 'S-03' } // Low stock initially!
      ];
      demoIngredients.forEach(i => {
        batch.set(doc(db, 'ingredients', i.id), i);
      });

      // Seed some initial purchase records to make analytics beautiful
      const today = new Date();
      const formatOffsetDate = (daysAgo: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };

      const demoPurchases: PurchaseRecord[] = [
        { id: 'P-01', ingredientId: 'I-01', supplierId: 'S-01', purchaseDate: formatOffsetDate(10), quantity: 30, cost: 1200 },
        { id: 'P-02', ingredientId: 'I-03', supplierId: 'S-03', purchaseDate: formatOffsetDate(8), quantity: 25, cost: 7500 },
        { id: 'P-03', ingredientId: 'I-04', supplierId: 'S-02', purchaseDate: formatOffsetDate(5), quantity: 40, cost: 2400 },
        { id: 'P-04', ingredientId: 'I-07', supplierId: 'S-02', purchaseDate: formatOffsetDate(3), quantity: 15, cost: 4500 },
        { id: 'P-05', ingredientId: 'I-08', supplierId: 'S-03', purchaseDate: formatOffsetDate(1), quantity: 10, cost: 3800 }
      ];
      demoPurchases.forEach(p => {
        batch.set(doc(db, 'purchases', p.id), p);
      });

      // Seed initial logs for purchases
      demoPurchases.forEach(p => {
        const logId = `LOG-P-${p.id}`;
        batch.set(doc(db, 'inventoryLogs', logId), {
          id: logId,
          ingredientId: p.ingredientId,
          type: 'in',
          quantity: p.quantity,
          reason: 'purchase',
          date: p.purchaseDate,
          timestamp: Date.now() - 86400000 * 2 // a couple of days ago
        });
      });

      // Seed some mock daily usage logs for analytics (e.g. past 5 days)
      for (let day = 1; day <= 5; day++) {
        const dateStr = formatOffsetDate(day);
        const dailyTomatoUsage = Math.floor(Math.random() * 5) + 3;
        const dailyChickenUsage = Math.floor(Math.random() * 4) + 2;
        const dailyMilkUsage = Math.floor(Math.random() * 6) + 4;

        batch.set(doc(db, 'inventoryLogs', `LOG-U-${day}-1`), {
          id: `LOG-U-${day}-1`,
          ingredientId: 'I-01',
          type: 'out',
          quantity: dailyTomatoUsage,
          reason: 'daily_usage',
          date: dateStr,
          timestamp: Date.now() - 86400000 * day
        });

        batch.set(doc(db, 'inventoryLogs', `LOG-U-${day}-2`), {
          id: `LOG-U-${day}-2`,
          ingredientId: 'I-03',
          type: 'out',
          quantity: dailyChickenUsage,
          reason: 'daily_usage',
          date: dateStr,
          timestamp: Date.now() - 86400000 * day
        });

        batch.set(doc(db, 'inventoryLogs', `LOG-U-${day}-3`), {
          id: `LOG-U-${day}-3`,
          ingredientId: 'I-04',
          type: 'out',
          quantity: dailyMilkUsage,
          reason: 'daily_usage',
          date: dateStr,
          timestamp: Date.now() - 86400000 * day
        });
      }

      // Seed default recipe mappings
      const { menuItems } = useAdminStore.getState();
      const mapItem = (itemName: string, ingredients: RecipeIngredient[]) => {
        const item = menuItems.find(m => m.name.toLowerCase().includes(itemName.toLowerCase()));
        if (item) {
          batch.set(doc(db, 'recipes', item.id), {
            id: item.id,
            menuItemId: item.id,
            ingredients
          });
        }
      };

      // Let's create mappings matching typical menu items
      mapItem('pizza', [
        { ingredientId: 'I-06', quantity: 1.0 }, // 1 Pizza Dough
        { ingredientId: 'I-07', quantity: 0.2 }, // 0.2 Kg Mozzarella
        { ingredientId: 'I-01', quantity: 0.15 } // 0.15 Kg Tomato
      ]);
      mapItem('burger', [
        { ingredientId: 'I-03', quantity: 0.18 }, // 0.18 Kg Chicken
        { ingredientId: 'I-09', quantity: 0.05 }, // 0.05 Kg Lettuce
        { ingredientId: 'I-07', quantity: 0.03 }  // 0.03 Kg Cheese
      ]);
      mapItem('coffee', [
        { ingredientId: 'I-04', quantity: 0.25 }, // 0.25 Liters Milk
        { ingredientId: 'I-08', quantity: 0.02 }  // 0.02 Kg Coffee Beans
      ]);
      mapItem('latte', [
        { ingredientId: 'I-04', quantity: 0.30 }, // 0.3 Liters Milk
        { ingredientId: 'I-08', quantity: 0.02 }  // 0.02 Kg Coffee Beans
      ]);
      mapItem('pasta', [
        { ingredientId: 'I-01', quantity: 0.20 }, // 0.2 Kg Tomato
        { ingredientId: 'I-05', quantity: 0.04 }, // 0.04 Kg Butter
        { ingredientId: 'I-07', quantity: 0.05 }  // 0.05 Kg Cheese
      ]);
      mapItem('salad', [
        { ingredientId: 'I-09', quantity: 0.15 }, // 0.15 Kg Lettuce
        { ingredientId: 'I-01', quantity: 0.10 }  // 0.10 Kg Tomato
      ]);
      mapItem('salmon', [
        { ingredientId: 'I-10', quantity: 0.25 }, // 0.25 Kg Salmon
        { ingredientId: 'I-05', quantity: 0.03 }  // 0.03 Kg Butter
      ]);

      await batch.commit();
      console.log("Demo inventory data successfully seeded!");
    } catch (error) {
      console.error("Failed to seed demo inventory data:", error);
    }
  },

  addIngredient: async (ing) => {
    const nextId = `I-${Math.floor(Math.random() * 9000) + 1000}`;
    const newIng: Ingredient = { ...ing, id: nextId };
    try {
      await setDoc(doc(db, 'ingredients', nextId), newIng);
      // Log manual stock initialization
      await get().adjustStock(nextId, ing.quantity, 'in', 'manual_adjustment');
    } catch (e) {
      console.error("Error adding ingredient:", e);
    }
  },

  updateIngredient: async (id, updatedFields) => {
    try {
      await updateDoc(doc(db, 'ingredients', id), updatedFields);
    } catch (e) {
      console.error("Error updating ingredient:", e);
    }
  },

  deleteIngredient: async (id) => {
    try {
      await deleteDoc(doc(db, 'ingredients', id));
    } catch (e) {
      console.error("Error deleting ingredient:", e);
    }
  },

  addSupplier: async (sup) => {
    const nextId = `S-${Math.floor(Math.random() * 9000) + 1000}`;
    const newSup: Supplier = { ...sup, id: nextId };
    try {
      await setDoc(doc(db, 'suppliers', nextId), newSup);
    } catch (e) {
      console.error("Error adding supplier:", e);
    }
  },

  updateSupplier: async (id, updatedFields) => {
    try {
      await updateDoc(doc(db, 'suppliers', id), updatedFields);
    } catch (e) {
      console.error("Error updating supplier:", e);
    }
  },

  deleteSupplier: async (id) => {
    try {
      await deleteDoc(doc(db, 'suppliers', id));
    } catch (e) {
      console.error("Error deleting supplier:", e);
    }
  },

  saveRecipe: async (menuItemId, ingredients) => {
    try {
      const recipeDoc = doc(db, 'recipes', menuItemId);
      const newMapping: RecipeMapping = {
        id: menuItemId,
        menuItemId,
        ingredients
      };
      await setDoc(recipeDoc, newMapping);
    } catch (e) {
      console.error("Error saving recipe:", e);
    }
  },

  deleteRecipe: async (menuItemId) => {
    try {
      await deleteDoc(doc(db, 'recipes', menuItemId));
    } catch (e) {
      console.error("Error deleting recipe mapping:", e);
    }
  },

  recordPurchase: async (pur) => {
    const nextId = `P-${Math.floor(Math.random() * 9000) + 1000}`;
    const record: PurchaseRecord = { ...pur, id: nextId };
    
    try {
      // 1. Write purchase ledger entry
      await setDoc(doc(db, 'purchases', nextId), record);
      
      // 2. Adjust stock
      const ingDoc = get().ingredients.find(i => i.id === pur.ingredientId);
      if (ingDoc) {
        const newQty = ingDoc.quantity + pur.quantity;
        await updateDoc(doc(db, 'ingredients', pur.ingredientId), { quantity: newQty });
        
        // 3. Log stock-in
        const logId = `LOG-P-${nextId}`;
        await setDoc(doc(db, 'inventoryLogs', logId), {
          id: logId,
          ingredientId: pur.ingredientId,
          type: 'in',
          quantity: pur.quantity,
          reason: 'purchase',
          date: pur.purchaseDate,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.error("Error recording purchase:", e);
    }
  },

  adjustStock: async (ingredientId, quantity, type, reason) => {
    try {
      const ing = get().ingredients.find(i => i.id === ingredientId);
      if (!ing) return;

      const delta = type === 'in' ? quantity : -quantity;
      const newQty = Math.max(0, ing.quantity + delta);
      
      await updateDoc(doc(db, 'ingredients', ingredientId), { quantity: newQty });

      const logId = `LOG-ADJ-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
      const logDate = new Date().toISOString().split('T')[0];
      
      await setDoc(doc(db, 'inventoryLogs', logId), {
        id: logId,
        ingredientId,
        type,
        quantity,
        reason,
        date: logDate,
        timestamp: Date.now()
      });

      // Low Stock Alert on out updates
      if (type === 'out' && newQty < ing.minStock) {
        useAdminStore.getState().addNotification(
          'Low Stock Alert',
          `Ingredient "${ing.name}" is running low (${newQty.toFixed(2)} ${ing.unit} remaining, min: ${ing.minStock} ${ing.unit})`,
          'System'
        );
      }
    } catch (e) {
      console.error("Error adjusting stock:", e);
    }
  },

  createReorderRequest: async (ingredientId, quantity, supplierId) => {
    const nextId = `REQ-${Math.floor(Math.random() * 9000) + 1000}`;
    const request: ReorderRequest = {
      id: nextId,
      ingredientId,
      quantity,
      supplierId,
      status: 'Pending',
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'reorderRequests', nextId), request);
    } catch (e) {
      console.error("Error creating reorder request:", e);
    }
  },

  updateReorderStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, 'reorderRequests', id), { status });
    } catch (e) {
      console.error("Error updating reorder status:", e);
    }
  },

  approveReorder: async (id, quantity, cost) => {
    try {
      const reorder = get().reorders.find(r => r.id === id);
      if (!reorder) return;

      const todayStr = new Date().toISOString().split('T')[0];
      
      // 1. Create purchase record
      await get().recordPurchase({
        ingredientId: reorder.ingredientId,
        supplierId: reorder.supplierId,
        purchaseDate: todayStr,
        quantity,
        cost
      });

      // 2. Mark request completed
      await updateDoc(doc(db, 'reorderRequests', id), {
        status: 'Completed',
        approvedAt: Date.now()
      });
    } catch (e) {
      console.error("Error approving reorder request:", e);
    }
  },

  deductIngredientsForOrder: async (items) => {
    // Make sure we have latest local copies
    const ingredients = get().ingredients;
    const recipes = get().recipes;
    const { menuItems } = useAdminStore.getState();

    for (const orderItem of items) {
      // Find menu item ID from name
      const menuItem = menuItems.find(m => m.name.toLowerCase() === orderItem.name.toLowerCase());
      if (!menuItem) continue;

      // Find recipe mapping
      const recipe = recipes.find(r => r.menuItemId === menuItem.id);
      if (!recipe) continue;

      // Deduct each ingredient
      for (const recipeIng of recipe.ingredients) {
        const ing = ingredients.find(i => i.id === recipeIng.ingredientId);
        if (!ing) continue;

        const totalDeducted = recipeIng.quantity * orderItem.quantity;
        const newQty = Math.max(0, ing.quantity - totalDeducted);

        // 1. Update ingredient quantity in db
        await updateDoc(doc(db, 'ingredients', ing.id), { quantity: newQty });

        // 2. Add inventory log
        const logId = `LOG-DED-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
        const todayStr = new Date().toISOString().split('T')[0];
        
        await setDoc(doc(db, 'inventoryLogs', logId), {
          id: logId,
          ingredientId: ing.id,
          type: 'out',
          quantity: totalDeducted,
          reason: 'order_deduction',
          date: todayStr,
          timestamp: Date.now()
        });

        // 3. Trigger notification if below min stock
        if (newQty < ing.minStock) {
          useAdminStore.getState().addNotification(
            'Low Stock Warning',
            `Ingredient "${ing.name}" has fallen below minimum stock level (${newQty.toFixed(2)} ${ing.unit} remaining, min: ${ing.minStock} ${ing.unit})`,
            'System'
          );
        }
      }
    }
  }
}));
