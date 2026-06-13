import { useState, useEffect } from 'react';
import { useChefStore } from '../store/useChefStore';
import { Flame, Clock, Coffee, Clipboard, User, Play, CheckCircle, ChevronRight, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PreparingPage() {
  const { activeChef, orders, markReady, startPreparing } = useChefStore();
  const [now, setNow] = useState(Date.now());

  // AI Recipe Helper States
  const [selectedDishForRecipe, setSelectedDishForRecipe] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<string | null>(null);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [autoRecipes, setAutoRecipes] = useState<Record<string, { loading: boolean; result: string | null; error: string | null }>>({});

  // Derived values declared at the very top of the function body to prevent TDZ issues
  const chefOrders = activeChef ? orders.filter((o) => o.assignedChefId === activeChef.id) : [];
  const activeOrder = chefOrders.find((o) => o.status === 'Preparing');
  const pendingOrders = chefOrders.filter((o) => o.status === 'New').sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const readyOrders = chefOrders.filter((o) => o.status === 'Ready');

  const onBreak = activeChef && activeChef.breakUntil && now < activeChef.breakUntil ? true : false;
  const breakSecondsLeft = onBreak && activeChef.breakUntil ? Math.max(0, Math.round((activeChef.breakUntil - now) / 1000)) : 0;

  // Tick the local state timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-Recipe loading state for active order items
  useEffect(() => {
    if (!activeOrder) {
      setAutoRecipes({});
      return;
    }

    activeOrder.items.forEach(async (item) => {
      const dishName = item.name;
      // If already fetching or loaded, skip
      if (autoRecipes[dishName]) return;

      setAutoRecipes(prev => ({
        ...prev,
        [dishName]: { loading: true, result: null, error: null }
      }));

      const groqKey = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
      if (!groqKey) {
        setTimeout(() => {
          const fallbacks: Record<string, string> = {
            'sweet corn pizza': `### 🍕 Sweet Corn Pizza Guide
* **Prep**: 10m | **Cook**: 8m
* **Ingredients**: Dough, Tomato Sauce, Mozzarella, Sweet Corn, Bell Peppers, Oregano.
1. Roll dough to 10".
2. Spread sauce, sprinkle mozzarella.
3. Top with corn and bell peppers.
4. Bake at 220°C for 8-10m.`,
            'paneer butter masala': `### 🍲 Paneer Butter Masala Guide
* **Prep**: 15m | **Cook**: 15m
* **Ingredients**: Paneer, Butter, Tomato, Cashew, Garam Masala, Cream.
1. Sauté ginger-garlic and tomato.
2. Blend cashew paste.
3. Simmer paneer cubes for 3m.
4. Stir in cream.`,
            'kaaju paneer biryani': `### 🍚 Kaaju Paneer Biryani Guide
* **Prep**: 20m | **Cook**: 25m
* **Ingredients**: Basmati, Paneer, Cashews, Biryani Spices, Saffron.
1. Layer rice and paneer masala in pot.
2. Top with cashews.
3. Dum-cook for 15-20m.`
          };
          const key = dishName.toLowerCase().replace(/\s+/g, ' ').trim();
          let matched = '';
          for (const [k, v] of Object.entries(fallbacks)) {
            if (key.includes(k) || k.includes(key)) {
              matched = v;
              break;
            }
          }
          setAutoRecipes(prev => ({
            ...prev,
            [dishName]: { 
              loading: false, 
              result: matched || `### 🍽️ AI Prep Guide: ${dishName}
1. Prepare standard pantry ingredients.
2. Sauté base aromatics.
3. Cook and plate.`, 
              error: null 
            }
          }));
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
                content: 'You are an expert executive chef. Write a highly condensed, quick recipe guide for line cooks. Use numbered list for steps. Keep it under 60 words.'
              },
              {
                role: 'user',
                content: `Fast instructions for: "${dishName}".`
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        if (!response.ok) throw new Error("API failed");
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No instructions.';
        setAutoRecipes(prev => ({
          ...prev,
          [dishName]: { loading: false, result: content, error: null }
        }));
      } catch (err) {
        setAutoRecipes(prev => ({
          ...prev,
          [dishName]: { loading: false, result: null, error: 'Failed to load guide.' }
        }));
      }
    });
  }, [activeOrder?.id, activeOrder?.items]);

  if (!activeChef) return null;

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
        const key = dishName.toLowerCase().replace(/\s+/g, ' ').trim();
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

  // Formatting helper for MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate cooking progress
  let secondsLeft = 0;
  let totalSeconds = 0;
  let elapsedPercent = 0;

  if (activeOrder && activeOrder.completedAt && activeOrder.startedPreparingAt) {
    totalSeconds = Math.round((activeOrder.completedAt - activeOrder.startedPreparingAt) / 1000);
    secondsLeft = Math.max(0, Math.round((activeOrder.completedAt - now) / 1000));
    elapsedPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  }

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-[28px] border border-[#f1f5f9] shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={activeChef.avatar} 
              alt={activeChef.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/20"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              onBreak ? 'bg-indigo-500' : activeOrder ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800 font-poppins">{activeChef.name}</h1>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {activeChef.id}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{activeChef.section || 'Kitchen Station'}</p>
          </div>
        </div>

        {/* Global Station Status */}
        <div className="flex items-center gap-3">
          {onBreak ? (
            <div className="flex items-center gap-2.5 px-4.5 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl text-xs font-black uppercase tracking-wider">
              <Coffee className="w-4 h-4 text-indigo-500 animate-bounce" />
              <span>ON BREAK ({formatTime(breakSecondsLeft)})</span>
            </div>
          ) : activeOrder ? (
            <div className="flex items-center gap-2.5 px-4.5 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>COOKING ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4.5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-xs font-black uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>STANDBY AVAILABLE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Console Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Large Active Workspace (Cooking Timer / Break Timer) */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Break Time Screen */}
            {onBreak && (
              <motion.div
                key="break-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#f1f5f9] rounded-[36px] p-8 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] text-center"
              >
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.04),transparent_60%)]" />
                
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex p-6 bg-indigo-50 text-indigo-500 border border-indigo-100 rounded-[28px] animate-pulse">
                    <Coffee className="w-16 h-16 stroke-[1.2]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black font-poppins tracking-wide text-slate-800">Chef's Recuperation Break</h2>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                      2-minute rest period. Next order in your queue will automatically begin once break ends.
                    </p>
                  </div>
                  
                  {/* Break Timer Countdown */}
                  <div className="py-2">
                    <span className="text-7xl font-black font-poppins tracking-wider text-[#7c3aed] select-none">
                      {formatTime(breakSecondsLeft)}
                    </span>
                    <span className="block text-[10px] uppercase tracking-widest font-black text-indigo-500 mt-2">
                      Seconds Remaining
                    </span>
                  </div>

                  {/* Progress bar for break */}
                  <div className="w-64 bg-slate-100 h-2 rounded-full overflow-hidden mx-auto border border-slate-200/50">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: `${(breakSecondsLeft / 120) * 100}%` }}
                      transition={{ ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Cooking Ticket */}
            {!onBreak && activeOrder && (
              <motion.div
                key="cooking-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#f1f5f9] rounded-[36px] p-8 shadow-sm flex flex-col justify-between min-h-[420px] relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-slate-800 font-poppins tracking-tight">
                        {activeOrder.id}
                      </span>
                      <span className="text-xs font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-xl border border-orange-100 flex items-center gap-1.5 uppercase">
                        <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                        Cooking
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Received at {activeOrder.timeReceived}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xl font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100 shadow-sm block">
                      Table {activeOrder.tableNumber}
                    </span>
                  </div>
                </div>

                {/* Body: Prep Countdown Timer & Progress Bar */}
                <div className="flex flex-col md:flex-row items-center gap-8 py-8">
                  {/* Progress Circle & Text Countdown */}
                  <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="78"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="88"
                        cy="88"
                        r="78"
                        fill="none"
                        stroke="url(#cook-gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "490", strokeDashoffset: "490" }}
                        animate={{ strokeDashoffset: 490 - (490 * elapsedPercent) / 100 }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                      <defs>
                        <linearGradient id="cook-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-800 font-poppins tracking-tight">
                        {formatTime(secondsLeft)}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Time Remaining
                      </span>
                    </div>
                  </div>

                  {/* Cooking Details & Automatic Progress Checklist */}
                  <div className="flex-1 space-y-4.5 w-full">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400 tracking-wider">
                      <span>Recipe Itemization</span>
                      <span className="text-orange-500">Total Prep Time: {activeOrder.prepTimeMins}m</span>
                    </div>
                    
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {activeOrder.items.map((item, idx) => {
                        // Let's create a mock automated cook checklist:
                        // As time progresses, checking items sequentially
                        // E.g. Item 1 completes in first half, Item 2 completes in second half
                        const itemThreshold = (idx + 1) * (totalSeconds / activeOrder.items.length);
                        const elapsedSecs = totalSeconds - secondsLeft;
                        const isItemAutoCooked = elapsedSecs >= itemThreshold;

                        return (
                          <div 
                            key={idx} 
                            className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all ${
                              isItemAutoCooked 
                                ? 'bg-emerald-50/40 border-emerald-100 text-slate-400' 
                                : 'bg-[#fafafc] border-[#f1f5f9] text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isItemAutoCooked 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'bg-white border-slate-200 text-transparent'
                              }`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[13.5px] font-extrabold truncate max-w-[150px] ${
                                isItemAutoCooked ? 'line-through text-slate-400' : ''
                              }`}>
                                {item.name}
                              </span>
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
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                isItemAutoCooked ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-[#f1f5f9] text-amber-500'
                              }`}>
                                {isItemAutoCooked ? 'COCKED' : 'COOKING'}
                              </span>
                              <span className="text-[13px] font-black text-slate-400">
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI Step-by-Step Cooking Assistant Panel */}
                <div className="mt-4 bg-purple-50/20 border border-purple-100/60 p-5 rounded-[24px] space-y-3.5">
                  <div className="flex items-center gap-2 text-purple-800">
                    <Sparkles className="w-4.5 h-4.5 animate-pulse text-purple-650" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest font-poppins">AI Cooking Assistant (Auto-Generated)</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {activeOrder.items.map((item, idx) => {
                      const recipe = autoRecipes[item.name];
                      return (
                        <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl space-y-2 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[9.5px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Dish {idx + 1}: {item.name}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase font-poppins">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          
                          {recipe?.loading ? (
                            <div className="flex items-center gap-2 py-1 text-slate-400">
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                              <span className="text-[11px] font-bold">Consulting Groq Llama 3 for recipe...</span>
                            </div>
                          ) : recipe?.error ? (
                            <p className="text-[10px] font-bold text-rose-500">{recipe.error}</p>
                          ) : (
                            <div className="text-[11.5px] font-bold text-slate-655 space-y-1 pl-1 select-text">
                              {renderFormattedRecipe(recipe?.result || '')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer and Debug Override button */}
                <div className="border-t border-slate-50 pt-4 flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Station: {activeChef.id}</span>
                  </div>
                  
                  {/* Manual testing trigger button (styled small) */}
                  <button 
                    onClick={() => markReady(activeOrder.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10.5px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Force Mark Ready (Manual Override)
                  </button>
                </div>
              </motion.div>
            )}

            {/* Standby/Empty Screen */}
            {!onBreak && !activeOrder && (
              <motion.div
                key="standby-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border border-[#f1f5f9] rounded-[36px] p-8 shadow-sm flex flex-col items-center justify-center min-h-[420px] text-center"
              >
                <div className="inline-flex p-6 bg-slate-50 text-slate-400 border border-slate-100 rounded-[28px] mb-5">
                  <Flame className="w-12 h-12 stroke-[1.2]" />
                </div>
                <h3 className="text-lg font-black text-slate-800 font-poppins">All Dishes Plated</h3>
                <p className="text-xs text-slate-400 font-semibold mt-1 max-w-xs mx-auto leading-relaxed">
                  Your cooking terminal is currently standby. Incoming orders assigned to your station will automatically start preparation.
                </p>
                
                {/* Manual Start button for any New orders */}
                {pendingOrders.length > 0 && (
                  <button 
                    onClick={() => startPreparing(pendingOrders[0].id)}
                    className="mt-6 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Next Order Now
                  </button>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Side: Upcoming Queue & Counter Pass */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Queue */}
          <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-slate-400" />
                <h3 className="text-[13.5px] font-black text-slate-800 uppercase tracking-wider">Upcoming Queue</h3>
              </div>
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                {pendingOrders.length} Tickets
              </span>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {pendingOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  Queue is clear.
                </div>
              ) : (
                pendingOrders.map((order, idx) => (
                  <div key={order.id} className="bg-[#fafafc] border border-[#f1f5f9] rounded-2xl p-4 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-800">{order.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Table {order.tableNumber}</span>
                      </div>
                      <p className="text-[11.5px] font-extrabold text-slate-500 truncate mt-1">
                        {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md block text-center">
                        ⏱️ {order.prepTimeMins}m
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 mt-1 block uppercase">
                        {idx === 0 ? 'Up Next' : `Wait #${idx}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Plated Awaiting Pickup (Ready) */}
          <div className="bg-white border border-[#f1f5f9] rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="text-[13.5px] font-black text-slate-800 uppercase tracking-wider">Awaiting Pickup</h3>
              </div>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full">
                {readyOrders.length} Plated
              </span>
            </div>

            <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
              {readyOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  Counter is clear.
                </div>
              ) : (
                readyOrders.map((order) => (
                  <div key={order.id} className="bg-emerald-50/10 border border-emerald-100/40 rounded-2xl p-4 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-emerald-700">{order.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Table {order.tableNumber}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 truncate mt-1">
                        {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    
                    <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                      Ready 🛎️
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

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
