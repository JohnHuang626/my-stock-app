import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp, getDoc } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Plus, Trash2, Edit2, Save, Database, TrendingUp, DollarSign, Calendar, PieChart as PieIcon, UploadCloud, Users, Briefcase, Minus, RefreshCw } from 'lucide-react';

// --- Firebase Configuration ---
// 修正說明：這裡改回自動判斷模式。
// 1. 在預覽環境 (Canvas) 中，它會讀取系統內建的 __firebase_config，解決 token mismatch 錯誤。
// 2. 當您下載部署時，因為沒有 __firebase_config，它會自動使用後面的 { apiKey: ... } 設定。
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
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

// 新增：庫存卡片元件
const InventoryCard = ({ stockId, lots, onUpdate }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
    <div>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xl font-bold text-slate-800">{stockId}</span>
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">庫存</span>
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold text-blue-600">{lots}</span>
        <span className="text-sm text-slate-400 ml-1">張</span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 mt-auto">
       <button 
          onClick={() => onUpdate(stockId, -1)}
          className="flex items-center justify-center gap-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
       >
          <Minus className="w-4 h-4" /> 賣出
       </button>
       <button 
          onClick={() => onUpdate(stockId, 1)}
          className="flex items-center justify-center gap-1 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
       >
          <Plus className="w-4 h-4" /> 買入
       </button>
    </div>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [holdings, setHoldings] = useState([]); // 新增：庫存資料
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardYear, setDashboardYear] = useState(2024); // 新增：儀表板年份狀態，預設為2024
  
  // Form State
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    stockId: '00',
    dividendPerLot: '',
    lots: '',
  });
  const [editingId, setEditingId] = useState(null);

  // --- Generate Dynamic Years (2024 ~ Current + 5 years) ---
  const yearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const endYear = Math.max(currentYear + 5, 2030); // 至少顯示到 2030
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, []);

  // --- Setting Document Title & Favicon ---
  useEffect(() => {
    // 1. 設定瀏覽器標籤名稱
    document.title = "存股配息管家 | 我的被動收入儀表板";

    // 2. 動態設定瀏覽器圖示 (Favicon)
    const setFavicon = () => {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.type = 'image/svg+xml';
      // 這是一個藍色的趨勢向上折線圖 SVG
      link.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`;
    };
    
    setFavicon();
  }, []);

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
    
    // Fetch Dividends
    const qData = query(collection(db, 'artifacts', appId, 'public', 'data', 'dividends'));
    const unsubData = onSnapshot(qData, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      records.sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
      });
      setData(records);
      setLoading(false);
    });

    // Fetch Holdings (庫存)
    const qHoldings = query(collection(db, 'artifacts', appId, 'public', 'data', 'holdings'));
    const unsubHoldings = onSnapshot(qHoldings, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      records.sort((a, b) => a.stockId.localeCompare(b.stockId)); // Sort by Stock ID
      setHoldings(records);
    });

    return () => {
        unsubData();
        unsubHoldings();
    };
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

  // 庫存更新功能：當使用者在輸入 ETF 代號時，自動帶入庫存張數
  useEffect(() => {
    if (formData.stockId && formData.stockId.length >= 4 && !editingId) {
        const holding = holdings.find(h => h.stockId === formData.stockId.toUpperCase());
        if (holding) {
            setFormData(prev => ({ ...prev, lots: holding.lots }));
        }
    }
  }, [formData.stockId, holdings, editingId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      stockId: formData.stockId.toUpperCase(),
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

  // --- Inventory Actions ---

  // 同步：從股息紀錄中找出每檔股票「最新」的張數，更新到庫存
  const handleSyncHoldings = async () => {
      if (!window.confirm("系統將會掃描所有「股息明細」，並以最新的張數更新庫存。確定要執行嗎？")) return;
      
      const latestMap = {};
      
      // 找出每檔股票最新的紀錄
      data.forEach(item => {
          const currentDate = item.year * 100 + item.month;
          if (!latestMap[item.stockId] || currentDate > latestMap[item.stockId].date) {
              latestMap[item.stockId] = { date: currentDate, lots: item.lots };
          }
      });

      const batch = [];
      Object.keys(latestMap).forEach(stockId => {
          // Check if we need to update
          const currentHolding = holdings.find(h => h.stockId === stockId);
          if (!currentHolding || currentHolding.lots !== latestMap[stockId].lots) {
               // Use stockId as doc ID for easy access
               const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'holdings', stockId);
               batch.push(setDoc(docRef, { 
                   stockId, 
                   lots: latestMap[stockId].lots,
                   updatedAt: serverTimestamp()
               }));
          }
      });

      if (batch.length > 0) {
        await Promise.all(batch);
        alert(`已同步更新 ${batch.length} 檔股票的庫存！`);
      } else {
        alert("庫存已經是最新狀態！");
      }
  };

  const handleUpdateHolding = async (stockId, change) => {
      const amount = parseFloat(window.prompt(`請輸入${change > 0 ? '買入' : '賣出'}張數：`, "1"));
      if (isNaN(amount) || amount <= 0) return;

      const currentHolding = holdings.find(h => h.stockId === stockId);
      const currentLots = currentHolding ? currentHolding.lots : 0;
      const newLots = change > 0 ? currentLots + amount : currentLots - amount;

      if (newLots < 0) {
          alert("賣出張數不能大於庫存！");
          return;
      }

      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'holdings', stockId), {
          stockId,
          lots: newLots,
          updatedAt: serverTimestamp()
      });
  };

  const handleAddStock = async () => {
      const stockId = window.prompt("請輸入新的 ETF 代號 (例如: 0050)：");
      if (!stockId) return;
      const lots = parseFloat(window.prompt("請輸入目前持有張數：", "0"));
      if (isNaN(lots)) return;

      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'holdings', stockId.toUpperCase()), {
        stockId: stockId.toUpperCase(),
        lots: lots,
        updatedAt: serverTimestamp()
    });
  };


  // --- Calculations ---
  const stats = useMemo(() => {
    // 改為動態計算：根據 dashboardYear 計算當年與隔年
    const totalCurrent = data.filter(d => d.year === dashboardYear).reduce((sum, d) => sum + (d.total || 0), 0);
    const totalNext = data.filter(d => d.year === dashboardYear + 1).reduce((sum, d) => sum + (d.total || 0), 0);
    const totalAll = data.reduce((sum, d) => sum + (d.total || 0), 0);
    
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const inCurrent = data.filter(d => d.year === dashboardYear && d.month === month).reduce((sum, d) => sum + d.total, 0);
        const inNext = data.filter(d => d.year === dashboardYear + 1 && d.month === month).reduce((sum, d) => sum + d.total, 0);
        return {
            name: `${month}月`,
            [dashboardYear]: inCurrent,
            [dashboardYear + 1]: inNext
        };
    });

    const stockMap = {};
    data.forEach(d => {
        if (!stockMap[d.stockId]) stockMap[d.stockId] = 0;
        stockMap[d.stockId] += d.total;
    });
    const stockData = Object.keys(stockMap).map(key => ({ name: key, value: stockMap[key] }));

    return { totalCurrent, totalNext, totalAll, monthlyData, stockData };
  }, [data, dashboardYear]); // 相依性加入 dashboardYear


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
                title={`${dashboardYear} 總領股息`}
                value={`$${stats.totalCurrent.toLocaleString()}`} 
                subtext="已實現損益"
                icon={DollarSign}
                colorClass="text-emerald-600"
            />
            <StatCard 
                title={`${dashboardYear + 1} 預估/已領股息`}
                value={`$${stats.totalNext.toLocaleString()}`} 
                subtext={stats.totalNext > stats.totalCurrent ? `比去年增長 ${(stats.totalNext - stats.totalCurrent).toLocaleString()}` : '持續累積中'}
                icon={Database}
                colorClass="text-blue-600"
            />
             <StatCard 
                title="歷史總股息" 
                value={`$${stats.totalAll.toLocaleString()}`} 
                subtext="複利效應持續發酵 (含所有年份)"
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
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'inventory' 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4"/> 庫存管理</div>
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
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">每月現金流比較 ({dashboardYear} vs {dashboardYear + 1})</h3>
                        <select 
                            value={dashboardYear} 
                            onChange={(e) => setDashboardYear(parseInt(e.target.value))}
                            className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
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
                                <Bar dataKey={dashboardYear} name={`${dashboardYear} 配息`} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey={dashboardYear + 1} name={`${dashboardYear + 1} 配息`} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart & Empty State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">ETF 貢獻佔比 (歷史總計)</h3>
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

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fadeIn">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">目前持股庫存</h3>
                        <p className="text-sm text-slate-500 mt-1">
                           管理您的股票張數。這裡的設定會自動帶入「股息明細」新增表單中。
                        </p>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={handleSyncHoldings}
                            className="flex items-center gap-2 px-3 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                            <RefreshCw className="w-4 h-4" /> 同步紀錄
                        </button>
                        <button 
                            onClick={handleAddStock}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> 新增持股
                        </button>
                    </div>
                 </div>

                 {holdings.length === 0 ? (
                     <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                        <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-1">目前沒有庫存資料</h3>
                        <p className="text-slate-500 text-sm mb-6">您可以手動新增，或點擊上方「同步紀錄」從過去的股息表自動建立。</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {holdings.map(stock => (
                            <InventoryCard 
                                key={stock.id} 
                                stockId={stock.stockId} 
                                lots={stock.lots} 
                                onUpdate={handleUpdateHolding}
                            />
                        ))}
                     </div>
                 )}
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
                                        {yearOptions.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
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
                                {holdings.length > 0 && <p className="text-[10px] text-blue-500 mt-1">輸入代號後將自動帶入庫存張數</p>}
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