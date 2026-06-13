import { useState } from 'react';
import { useChefStore } from '../store/useChefStore';
import { ClipboardList, Clock, Flame, User, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ActiveOrdersPage() {
  const { activeChef, orders, startPreparing } = useChefStore();

  // AI Recipe Helper States
  const [selectedDishForRecipe, setSelectedDishForRecipe] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<string | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  const fetchRecipeFromGroq = async (dishName: string) => {
    setRecipeLoading(true);
    setRecipeError(null);
    setRecipeResult(null);
    
    const groqKey = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
    if (!groqKey) {
      setTimeout(() => {
        const fallbacks: Record<string, string> = {
          'sweet corn pizza': `### 🍕 Sweet Corn Pizza Guide
* **Prep Time**: 10 mins | **Cook Time**: 8 mins
* **Core Ingredients**: Pizza Dough, Tomato Sauce, Shredded Mozzarella, Sweet Corn, Bell Peppers, Oregano.

#### 👩‍🍳 Cooking Steps:
1. Roll out dough to 10 inches on a clean workspace.
2. Ladle pizza sauce in a spiral motion leaving 1/2 inch border.
3. Distribute mozzarella cheese evenly.
4. Top with sweet corn kernels and thinly sliced bell peppers.
5. Bake at 220°C (425°F) for 8-10 minutes until crust is crispy gold.
6. Season with oregano and chili flakes before slicing.`,
          'paneer butter masala': `### 🍲 Paneer Butter Masala Guide
* **Prep Time**: 15 mins | **Cook Time**: 15 mins
* **Core Ingredients**: Paneer cubes, Butter, Tomato puree, Cashew paste, Spices (Kashmiri Mirch, Garam Masala), Heavy Cream.

#### 👩‍🍳 Cooking Steps:
1. Heat butter in pan, cook ginger-garlic paste and tomato puree.
2. Blend in cashew paste to enrich the gravy base.
3. Add Garam Masala and cook until grease separates.
4. Fold paneer cubes gently and simmer for 3 minutes.
5. Finish with cream and chopped cilantro.`,
          'kaaju paneer biryani': `### 🍚 Kaaju Paneer Biryani Guide
* **Prep Time**: 20 mins | **Cook Time**: 25 mins
* **Core Ingredients**: Long-grain Basmati, Paneer, Fried Cashews (Kaaju), Biryani Spices, Saffron water, Fried Onions.

#### 👩‍🍳 Cooking Steps:
1. Boil basmati rice until 70% cooked. Drain well.
2. Pan-sear cashew nuts and paneer cubes in ghee until yellow-gold.
3. Cook biryani gravy masala with onions, tomatoes, yogurt, and spices.
4. Layer rice and paneer masala in a heavy pan. Top with cashews and saffron water.
5. Dum-cook on low flame for 15-20 minutes. Serve hot.`
        };
        const key = dishName.toLowerCase().trim();
        let matchedFallback = '';
        for (const [k, v] of Object.entries(fallbacks)) {
          if (key.includes(k) || k.includes(key)) {
            matchedFallback = v;
            break;
          }
        }
        
        if (matchedFallback) {
          setRecipeResult(matchedFallback);
        } else {
          setRecipeResult(`### 🍽️ AI Prep Guide for: ${dishName}
* **Estimated Prep Time**: 12 mins
* **Ingredients**: Standard pantry items for ${dishName}.

#### 👩‍🍳 Cooking Steps:
1. Inspect freshness of raw ingredients.
2. Clean, chop, or portion ingredients according to order volume.
3. Sauté base aromatics or pre-heat grill/oven.
4. Cook/assemble ${dishName} according to plating standards.
5. Garnish and serve immediately.
*(Simulated response. Please add VITE_GROQ_API_KEY to your env file to enable live Groq Llama 3).*`);
        }
        setRecipeLoading(false);
      }, 700);
      return;
    }
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are an expert executive chef training a line cook. Keep recipes concise, clear, and focused on steps and key ingredients. Use clean markdown formatting.'
            },
            {
              role: 'user',
              content: `Please provide a fast, professional prep guide (ingredients + step-by-step cooking steps) for a line chef preparing: "${dishName}". Keep it concise, under 150 words.`
            }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'No recipe instructions returned.';
      setRecipeResult(content);
    } catch (err: any) {
      console.error("Error fetching recipe from Groq:", err);
      setRecipeError("Failed to fetch recipe from Groq. Please check network connection or API Key.");
    } finally {
      setRecipeLoading(false);
    }
  };

  const renderFormattedRecipe = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-black text-slate-800 font-poppins mt-3 mb-1 uppercase tracking-wide">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} className="text-xs font-black text-slate-700 font-poppins mt-2 mb-1 uppercase tracking-wider">{line.replace('#### ', '')}</h5>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-extrabold text-xs text-slate-800 my-1">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('* ')) {
        return (
          <li key={idx} className="text-[12px] font-bold text-slate-600 list-disc ml-4 mt-0.5 leading-relaxed">
            {line.replace('* ', '').split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-850 font-black">{part}</strong> : part)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const cleanLine = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="text-[12px] font-bold text-slate-650 list-decimal ml-4 mt-1 leading-relaxed">
            {cleanLine.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-850 font-black">{part}</strong> : part)}
          </li>
        );
      }
      return (
        <p key={idx} className="text-[12px] font-bold text-slate-600 leading-relaxed my-1">
          {line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#0f172a] font-black">{part}</strong> : part)}
        </p>
      );
    });
  };

  if (!activeChef) return null;

  // Filter orders assigned to the logged-in chef with 'New' status
  const activeChefOrders = orders.filter(
    (o) => o.assignedChefId === activeChef.id && o.status === 'New'
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight">INCOMING QUEUE</h1>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
          New orders assigned to your station. Tap "Start Preparing" to send them to the cookline.
        </p>
      </div>

      {/* Orders Grid */}
      {activeChefOrders.length === 0 ? (
        <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-12 text-center max-w-lg mx-auto shadow-sm mt-10">
          <div className="inline-flex p-4 bg-blue-50 text-blue-500 rounded-2xl mb-4.5">
            <ClipboardList className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-[17px] font-black text-[#0f172a] font-poppins">No Incoming Orders</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed max-w-sm mx-auto">
            You don't have any new orders assigned to your station right now. The KDS load balancer will auto-route new dishes to your terminal when received.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {activeChefOrders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-[#f1f5f9] rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-start bg-slate-50/30">
                  <div>
                    <span className="text-2xl font-black text-[#0f172a] tracking-tight">{order.id}</span>
                    <div className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                      Time: {order.timeReceived}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#7c3aed] bg-purple-50 px-3.5 py-1 rounded-xl border border-purple-100">
                      Table {order.tableNumber}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 flex-1 space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Dishes to Prep
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-4 bg-[#fafafc] p-3 rounded-2xl border border-[#f1f5f9]">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDishForRecipe(item.name);
                              fetchRecipeFromGroq(item.name);
                            }}
                            className="p-1 bg-purple-50 hover:bg-purple-100 rounded-lg text-[#7c3aed] transition-colors cursor-pointer active:scale-95 shrink-0"
                            title="AI Prep Guide"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-[13.5px] text-[#0f172a] truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-black text-[13.5px] text-[#7c3aed] bg-purple-50 border border-purple-100 px-3 py-0.5 rounded-lg shrink-0">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer with Big Action Target */}
                <div className="p-6 pt-0 space-y-4">
                  {/* Stats Info */}
                  <div className="flex items-center gap-4.5 text-xs text-slate-500 font-bold border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{order.prepTimeMins} min prep</span>
                    </div>
                    <div className="w-[1px] h-3.5 bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Station: {activeChef.id}</span>
                    </div>
                  </div>

                  {/* Big Touch Target Action */}
                  <button
                    onClick={() => startPreparing(order.id)}
                    className="w-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white hover:opacity-95 text-sm font-black py-4.5 rounded-[20px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 active:scale-98 cursor-pointer uppercase tracking-wider"
                  >
                    <Flame className="w-4.5 h-4.5 animate-pulse" />
                    Start Preparing
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* AI Recipe Helper Modal */}
      <AnimatePresence>
        {selectedDishForRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2 text-purple-750">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                  <h3 className="text-md font-black font-poppins uppercase tracking-wider">Chef's AI Prep Guide</h3>
                </div>
                <button 
                  onClick={() => {
                    setSelectedDishForRecipe(null);
                    setRecipeResult(null);
                    setRecipeError(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-purple-50/40 border border-purple-100 p-4.5 rounded-2xl">
                  <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest block mb-1">Station item</span>
                  <h4 className="text-base font-black text-slate-800 font-poppins">{selectedDishForRecipe}</h4>
                </div>

                {recipeLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent"
                      />
                      <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide text-center">Consulting Groq Llama 3...</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold text-center">Generating professional line cook recipe steps</p>
                    </div>
                  </div>
                ) : recipeError ? (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center text-xs font-bold text-rose-600 space-y-2">
                    <p>{recipeError}</p>
                    <button 
                      onClick={() => fetchRecipeFromGroq(selectedDishForRecipe)}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg uppercase tracking-wider font-black text-[10px]"
                    >
                      Retry Fetch
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 prose max-w-none bg-slate-50/50 p-4.5 border border-slate-100 rounded-2xl">
                    {renderFormattedRecipe(recipeResult || '')}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                <button
                  onClick={() => {
                    setSelectedDishForRecipe(null);
                    setRecipeResult(null);
                    setRecipeError(null);
                  }}
                  className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
