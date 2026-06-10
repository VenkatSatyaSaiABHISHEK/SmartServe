import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';
import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export function LoginPage() {
  const { login } = useAdminStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const cleanedUsername = username.trim().toLowerCase();
      
      // 1. Try directly fetching by document ID
      const adminDocRef = doc(db, 'system_admins', cleanedUsername);
      const adminDoc = await getDoc(adminDocRef);
      let adminData = adminDoc.exists() ? adminDoc.data() : null;

      // 2. If not found by document ID, try querying by username field
      if (!adminData) {
        const q = query(collection(db, 'system_admins'), where('username', '==', cleanedUsername));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          adminData = querySnapshot.docs[0].data();
        }
      }
      
      if (adminData) {
        if (adminData.password === password || adminData.pin === password) {
          login();
          navigate('/admin');
          return;
        } else {
          setError('Invalid system administrator passcode PIN.');
          return;
        }
      } else {
        setError('Invalid system administrator credentials. Real database accounts only.');
      }
    } catch (err: any) {
      console.error("Error during admin authentication:", err);
      setError('Connection error occurred while logging in.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[70%] rounded-full bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-[430px] z-10">
        <div className="bg-white border border-[#f1f5f9] rounded-[32px] p-8 shadow-xl shadow-slate-100/50 flex flex-col items-center">
          
          {/* Logo badge */}
          <div className="w-12.5 h-12.5 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 mb-6.5">
            <KeyRound className="w-5 h-5 stroke-[2]" />
          </div>

          <h2 className="text-2xl font-black text-[#0f172a] font-poppins tracking-tight text-center">
            Admin ERP Portal
          </h2>
          <p className="text-[12.5px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">
            Secure HQ Administration Node
          </p>

          <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4.5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-[11px] font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-500/5 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Passcode PIN</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fafafc] border border-[#f1f5f9] rounded-xl px-4 py-3.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-500/5 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-md shadow-slate-900/10 mt-3"
            >
              Authenticate Station
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>



        </div>
      </div>
    </div>
  );
}
