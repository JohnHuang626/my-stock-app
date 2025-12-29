import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Plus, Trash2, Edit2, Save, Database, TrendingUp, DollarSign, Calendar, PieChart as PieIcon, UploadCloud, Users } from 'lucide-react';

// --- Firebase Configuration ---
// 注意：部署時請依照部署指南填入您的真實 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBLEzSFnnHjzM4_8VsMgHPq53dx9Y1NYnw",
  authDomain: "my-stock-dividend-6da91.firebaseapp.com",
  projectId: "my-stock-dividend-6da91",
  storageBucket: "my-stock-dividend-6da91.firebasestorage.app",
  messagingSenderId: "763134250434",
  appId: "1:763134250434:web:21ffb6db4f5d00912bda5b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Initial Data from User PDF ---
const PDF_DATA = [
  // 2024 Data
  { year: 2024, month: 1, stockId: '00878', dividendPerLot: 400, lots: 80 },
  { year: 2024, month: 2, stockId: '00713', dividendPerLot: 880, lots: 76 },
  { year: 2024, month: 3, stockId: '00919', dividendPerLot: 660, lots: 95 },
  { year: 2024, month: 4, stockId: '00878', dividendPerLot: 510, lots: 123 },
  { year: 2024, month: 5, stockId: '00713', dividendPerLot: 1500, lots: 90 },
  { year: 2024, month: 6, stockId: '00919', dividendPerLot: 700, lots: 125 },
  { year: 2024, month: 6, stockId: '0056', dividendPerLot: 1070, lots: 13 },
  { year: 2024, month: 7, stockId: '00940', dividendPerLot: 50, lots: 35 },
  { year: 2024, month: 7, stockId: '00692', dividendPerLot: 420, lots: 41 },
  { year: 2024, month: 7, stockId: '00878', dividendPerLot: 550, lots: 125 },
  { year: 2024, month: 8, stockId: '00940', dividendPerLot: 50, lots: 35 },
  { year: 2024, month: 8, stockId: '00713', dividendPerLot: 1500, lots: 90 },
  { year: 2024, month: 9, stockId: '00919', dividendPerLot: 720, lots: 127 },
  { year: 2024, month: 9, stockId: '00940', dividendPerLot: 50, lots: 35 },
  { year: 2024, month: 9, stockId: '0056', dividendPerLot: 1070, lots: 17 },
  { year: 2024, month: 10, stockId: '00940', dividendPerLot: 50, lots: 35 },
  { year: 2024, month: 10, stockId: '00878', dividendPerLot: 550, lots: 125 },
  { year: 2024, month: 11, stockId: '00940', dividendPerLot: 40, lots: 35 },
  { year: 2024, month: 11, stockId: '00692', dividendPerLot: 600, lots: 44 },
  { year: 2024, month: 11, stockId: '00713', dividendPerLot: 1400, lots: 92 },
  { year: 2024, month: 12, stockId: '00919', dividendPerLot: 720, lots: 127 },
  { year: 2024, month: 12, stockId: '00940', dividendPerLot: 40, lots: 35 },
  // 2025 Data
  { year: 2025, month: 1, stockId: '0056', dividendPerLot: 1070, lots: 20 },
  { year: 2025, month: 1, stockId: '00940', dividendPerLot: 30, lots: 35 },
  { year: 2025, month: 1, stockId: '00878', dividendPerLot: 500, lots: 125 },
  { year: 2025, month: 2, stockId: '00940', dividendPerLot: 30, lots: 20 },
  { year: 2025, month: 2, stockId: '00713', dividendPerLot: 1400, lots: 93 },
  { year: 2025, month: 3, stockId: '00919', dividendPerLot: 720, lots: 127 },
  { year: 2025, month: 3, stockId: '00940', dividendPerLot: 30, lots: 20 },
  { year: 2025, month: 4, stockId: '0056', dividendPerLot: 1070, lots: 20 },
  { year: 2025, month: 4, stockId: '00940', dividendPerLot: 20, lots: 20 },
  { year: 2025, month: 4, stockId: '00878', dividendPerLot: 470, lots: 125 },
  { year: 2025, month: 5, stockId: '00940', dividendPerLot: 30, lots: 20 },
  { year: 2025, month: 5, stockId: '00713', dividendPerLot: 1100, lots: 95 },
  { year: 2025, month: 6, stockId: '00919', dividendPerLot: 720, lots: 128 },
  { year: 2025, month: 6, stockId: '00940', dividendPerLot: 30, lots: 20 },
  { year: 2025, month: 6, stockId: '0056', dividendPerLot: 866, lots: 20 },
  { year: 2025, month: 7, stockId: '00940', dividendPerLot: 40, lots: 20 },
  { year: 2025, month: 7, stockId: '00692', dividendPerLot: 628, lots: 54 },
  { year: 2025, month: 7, stockId: '00878', dividendPerLot: 400, lots: 125 },
  { year: 2025, month: 8, stockId: '00940', dividendPerLot: 40, lots: 20 },
  { year: 2025, month: 8, stockId: '00713', dividendPerLot: 780, lots: 96 },
  { year: 2025, month: 9, stockId: '00919', dividendPerLot: 540, lots: 129 },
  { year: 2025, month: 9, stockId: '00940', dividendPerLot: 40, lots: 20 },
  { year: 2025, month: 9, stockId: '0056', dividendPerLot: 866, lots: 20 },
  { year: 2025, month: 10, stockId: '00940', dividendPerLot: 40, lots: 20 },
  { year: 2025, month: 10, stockId: '00878', dividendPerLot: 400, lots: 125 },
  { year: 2025, month: 11, stockId: '00940', dividendPerLot: 40, lots: 20 },
  { year: 2025, month: 11, stockId: '00692', dividendPerLot: 1252, lots: 60 },
  { year: 2025, month: 11, stockId: '00713', dividendPerLot: 780, lots: 96 },
  { year: 2025, month: 12, stockId: '00919', dividendPerLot: 540, lots: 129 },
  { year: 2025, month: 12, stockId: '00940', dividendPerLot: 40, lots: 20 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// --- Components ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className={`text-xs mt-2 ${colorClass || 'text-slate-400'}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass ? colorClass.replace('text-', 'bg-').replace('600', '100') : 'bg-blue-50'}`}>
      <Icon className={`w-6 h-6 ${colorClass || 'text-blue-600'}`} />
    </div>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Form State
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    stockId: '00',
    dividendPerLot: '',
    lots: '',
  });
  const [editingId, setEditingId] = useState(null);

  // --- Auth & Data Fetching ---
  useEffect(() => {
    // 啟用匿名登入
    const initAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // 關鍵修改：使用 'public/data' 路徑，讓所有人讀寫同一份資料
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'dividends')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side sorting
      records.sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
      });

      setData(records);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- Actions ---

  const handleImportData = async () => {
    if (!user) return;
    if (!window.confirm("這將會匯入所有 PDF 上的資料到「共用資料庫」。確定嗎？")) return;

    setLoading(true);
    const batch = [];
    const coll = collection(db, 'artifacts', appId, 'public', 'data', 'dividends');

    for (const item of PDF_DATA) {
        const docRef = doc(coll); 
        batch.push(setDoc(docRef, {
            ...item,
            total: item.dividendPerLot * item.lots,
            createdAt: serverTimestamp()
        }));
    }
    
    await Promise.all(batch);
    setLoading(false);
    alert("資料匯入成功！");
  };

  const handleDelete = async (id) => {
    if (!user || !window.confirm("確定刪除此筆資料？")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dividends', id));
  };

  const handleEdit = (record) => {
    setFormData({
      year: record.year,
      month: record.month,
      stockId: record.stockId,
      dividendPerLot: record.dividendPerLot,
      lots: record.lots
    });
    setEditingId(record.id);
    setActiveTab('data'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      stockId: formData.stockId,
      dividendPerLot: parseFloat(formData.dividendPerLot),
      lots: parseFloat(formData.lots),
      total: parseFloat(formData.dividendPerLot) * parseFloat(formData.lots),
      updatedAt: serverTimestamp()
    };

    if (editingId) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dividends', editingId), payload, { merge: true });
      setEditingId(null);
    } else {
      payload.createdAt = serverTimestamp();
      await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'dividends')), payload);
    }

    setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        stockId: '',
        dividendPerLot: '',
        lots: '',
    });
  };

  // --- Calculations ---
  const stats = useMemo(() => {
    const total2024 = data.filter(d => d.year === 2024).reduce((sum, d) => sum + (d.total || 0), 0);
    const total2025 = data.filter(d => d.year === 2025).reduce((sum, d) => sum + (d.total || 0), 0);
    
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const in2024 = data.filter(d => d.year === 2024 && d.month === month).reduce((sum, d) => sum + d.total, 0);
        const in2025 = data.filter(d => d.year === 2025 && d.month === month).reduce((sum, d) => sum + d.total, 0);
        return {
            name: `${month}月`,
            '2024': in2024,
            '2025': in2025
        };
    });

    const stockMap = {};
    data.forEach(d => {
        if (!stockMap[d.stockId]) stockMap[d.stockId] = 0;
        stockMap[d.stockId] += d.total;
    });
    const stockData = Object.keys(stockMap).map(key => ({ name: key, value: stockMap[key] }));

    return { total2024, total2025, monthlyData, stockData };
  }, [data]);


  // --- Render ---

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent hidden sm:block">
              存股配息管家 (共用版)
            </h1>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* 顯示目前模式 */}
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
               <Users className="w-3 h-3" />
               已連線至共用資料庫
            </span>

            <button 
                onClick={handleImportData}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
                <UploadCloud className="w-4 h-4" />
                匯入範例
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
                title="2024 總領股息" 
                value={`$${stats.total2024.toLocaleString()}`} 
                subtext="已實現損益"
                icon={DollarSign}
                colorClass="text-emerald-600"
            />
            <StatCard 
                title="2025 預估/已領股息" 
                value={`$${stats.total2025.toLocaleString()}`} 
                subtext={stats.total2025 > stats.total2024 ? `比去年增長 ${(stats.total2025 - stats.total2024).toLocaleString()}` : '持續累積中'}
                icon={Database}
                colorClass="text-blue-600"
            />
             <StatCard 
                title="歷史總股息" 
                value={`$${(stats.total2024 + stats.total2025).toLocaleString()}`} 
                subtext="複利效應持續發酵"
                icon={TrendingUp}
                colorClass="text-purple-600"
            />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
            <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'dashboard' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <div className="flex items-center gap-2"><PieIcon className="w-4 h-4"/> 戰情儀表板</div>
            </button>
            <button
                onClick={() => setActiveTab('data')}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'data' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> 股息明細與管理</div>
            </button>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
                
                {/* Monthly Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">每月現金流比較 (2024 vs 2025)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Legend />
                                <Bar dataKey="2024" name="2024 配息" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="2025" name="2025 配息" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart & Empty State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">ETF 貢獻佔比</h3>
                        <div className="h-64 w-full flex items-center justify-center">
                             {stats.stockData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.stockData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.stockData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                             ) : (
                                 <div className="text-slate-400 text-sm">尚無資料，請先匯入數據</div>
                             )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-2">持續累積資產</h3>
                        <p className="text-blue-100 mb-6">
                            "複利是世界第八大奇蹟。" <br/>
                            定期檢視你的股息成長，將股息再投入能加速資產累積。
                        </p>
                        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-blue-100">資料完整度</span>
                                <span className="text-sm font-bold">{data.length > 0 ? '100%' : '0%'}</span>
                            </div>
                            <div className="w-full bg-blue-900/30 rounded-full h-2">
                                <div 
                                    className="bg-green-400 h-2 rounded-full transition-all duration-1000" 
                                    style={{ width: data.length > 0 ? '100%' : '0%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                           {editingId ? <Edit2 className="w-4 h-4 text-blue-600"/> : <Plus className="w-4 h-4 text-blue-600"/>}
                           {editingId ? '編輯紀錄' : '新增股息紀錄'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">年份</label>
                                    <select 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                                    >
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">月份</label>
                                    <select 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.month}
                                        onChange={(e) => setFormData({...formData, month: e.target.value})}
                                    >
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>{m}月</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">ETF 代號</label>
                                <input 
                                    type="text"
                                    placeholder="例如: 00878"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    value={formData.stockId}
                                    onChange={(e) => setFormData({...formData, stockId: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">每張配息 (元)</label>
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.dividendPerLot}
                                        onChange={(e) => setFormData({...formData, dividendPerLot: e.target.value})}
                                        required
                                        min="0"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">請輸入每1000股配息金額</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">持有張數</label>
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.lots}
                                        onChange={(e) => setFormData({...formData, lots: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg mb-4">
                                    <span className="text-sm text-blue-600 font-medium">試算總額</span>
                                    <span className="text-lg font-bold text-blue-700">
                                        ${((parseFloat(formData.dividendPerLot) || 0) * (parseFloat(formData.lots) || 0)).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {editingId && (
                                        <button 
                                            type="button"
                                            onClick={() => { setEditingId(null); setFormData({year: 2024, month: 1, stockId: '', dividendPerLot: '', lots: ''}); }}
                                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            取消
                                        </button>
                                    )}
                                    <button 
                                        type="submit"
                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 font-medium"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingId ? '更新' : '儲存'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    
                    {data.length === 0 && (
                        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Database className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">尚無股息紀錄</h3>
                            <p className="text-slate-500 text-sm mb-6">開始輸入你的第一筆股息，或直接匯入範例</p>
                            <button 
                                onClick={handleImportData}
                                className="px-4 py-2 bg-white border border-slate-200 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                匯入 PDF 範例資料
                            </button>
                        </div>
                    )}

                    {data.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex flex-col items-center justify-center font-bold text-xs">
                                        <span className="text-sm">{item.month}月</span>
                                        <span className="text-blue-300 text-[10px]">{item.year}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 text-lg">{item.stockId}</span>
                                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{item.lots}張</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            每張配息 ${item.dividendPerLot}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">配息總額</p>
                                        <p className="text-xl font-bold text-emerald-600">${item.total.toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

    </div>
  );
};

export default App;