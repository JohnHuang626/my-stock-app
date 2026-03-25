import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp, getDoc } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Plus, Trash2, Edit2, Save, Database, TrendingUp, DollarSign, Calendar, PieChart as PieIcon, UploadCloud, Users, Briefcase, Minus, RefreshCw, Sparkles, Search, Download, X, Smartphone } from 'lucide-react';

// --- Firebase Configuration ---
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

// --- Initial Data ---
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
  const [holdings, setHoldings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [dashboardYear, setDashboardYear] = useState(() => new Date().getFullYear()); 
  const [autoFilled, setAutoFilled] = useState(false); 

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    stockId: '00',
    dividendPerLot: '',
    lots: '',
  });
  const [editingId, setEditingId] = useState(null);

  const yearOptions = useMemo(() => {
    const startYear = 2024;
    const currentYear = new Date().getFullYear();
    const endYear = Math.max(currentYear + 5, 2030); 
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, []);

  // --- Install Prompt Listener ---
  useEffect(() => {
    // 監聽瀏覽器的安裝提示事件 (需支援 PWA 的環境才會觸發)
    const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // --- Setting Document Title & PWA Manifest ---
  useEffect(() => {
    document.title = "存股配息管家 | 我的被動收入儀表板";

    const setupPWA = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.strokeStyle = '#2563eb'; 
      ctx.lineWidth = 80; 
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const scale = 800 / 24; 
      const offsetX = 112; 
      const offsetY = 112;

      const x = (val) => val * scale + offsetX;
      const y = (val) => val * scale + offsetY;

      ctx.beginPath();
      ctx.moveTo(x(1), y(18));
      ctx.lineTo(x(8.5), y(10.5));
      ctx.lineTo(x(13.5), y(15.5));
      ctx.lineTo(x(23), y(6));
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x(17), y(6));
      ctx.lineTo(x(23), y(6));
      ctx.lineTo(x(23), y(12));
      ctx.stroke();

      const iconUrl = canvas.toDataURL('image/png');

      // 1. Set Favicons
      let favicon = document.querySelector("link[rel*='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.type = 'image/png';
      favicon.href = iconUrl;

      let appleIcon = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = iconUrl;

      // 2. Inject PWA Manifest dynamically
      const manifest = {
        name: "存股配息管家",
        short_name: "配息管家",
        description: "我的被動收入儀表板",
        start_url: ".",
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#2563eb",
        icons: [
          {
            src: iconUrl,
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      };

      const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
      const manifestUrl = URL.createObjectURL(manifestBlob);
      let manifestLink = document.querySelector("link[rel='manifest']");
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestUrl;
    };
    
    setupPWA();
  }, []);

  // --- Auth & Data Fetching ---
  useEffect(() => {
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

    const qHoldings = query(collection(db, 'artifacts', appId, 'public', 'data', 'holdings'));
    const unsubHoldings = onSnapshot(qHoldings, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      records.sort((a, b) => a.stockId.localeCompare(b.stockId)); 
      setHoldings(records);
    });

    return () => {
        unsubData();
        unsubHoldings();
    };
  }, [user]);

  // --- Actions ---

  const handleInstallApp = async () => {
      // 若瀏覽器已準備好自動安裝提示，則直接調用
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
              setDeferredPrompt(null);
          }
      } else {
          // 若環境不支援自動彈出 (例如 iOS Safari，或 iframe 內)，則顯示圖文教學
          setShowInstallGuide(true);
      }
  };

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

  useEffect(() => {
    if (!formData.stockId || formData.stockId.length < 4 || editingId) return;

    const stockIdUpper = formData.stockId.toUpperCase();
    let updated = false;
    let newDividend = formData.dividendPerLot;
    let newLots = formData.lots;

    const holding = holdings.find(h => h.stockId === stockIdUpper);
    if (holding) {
        newLots = holding.lots;
    }

    const seedMatch = PDF_DATA.find(d => 
        d.year === parseInt(formData.year) && 
        d.month === parseInt(formData.month) && 
        d.stockId === stockIdUpper
    );

    if (seedMatch) {
        newDividend = seedMatch.dividendPerLot;
        if (newDividend !== formData.dividendPerLot) {
            setAutoFilled(true);
            updated = true;
        }
    } else {
        setAutoFilled(false);
    }

    if (holding && newLots !== formData.lots) updated = true;

    if (updated) {
        setFormData(prev => ({ ...prev, lots: newLots, dividendPerLot: newDividend }));
    }

  }, [formData.stockId, formData.year, formData.month, holdings, editingId]);

  const handleDividendChange = (e) => {
      setFormData({...formData, dividendPerLot: e.target.value});
      setAutoFilled(false);
  };

  const openYahooFinance = () => {
      if (!formData.stockId) return;
      const url = `https://tw.stock.yahoo.com/quote/${formData.stockId}/dividend`;
      window.open(url, '_blank');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    const dividend = parseFloat(formData.dividendPerLot) || 0;
    const lots = parseFloat(formData.lots) || 0;

    const payload = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      stockId: formData.stockId.toUpperCase(),
      dividendPerLot: dividend,
      lots: lots,
      total: dividend * lots,
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
    setAutoFilled(false);
  };

  // --- Inventory Actions ---
  const handleSyncHoldings = async () => {
      if (!window.confirm("系統將會掃描所有「股息明細」，並以最新的張數更新庫存。確定要執行嗎？")) return;
      
      const latestMap = {};
      
      data.forEach(item => {
          const currentDate = item.year * 100 + item.month;
          if (!latestMap[item.stockId] || currentDate > latestMap[item.stockId].date) {
              latestMap[item.stockId] = { date: currentDate, lots: item.lots };
          }
      });

      const batch = [];
      Object.keys(latestMap).forEach(stockId => {
          const currentHolding = holdings.find(h => h.stockId === stockId);
          if (!currentHolding || currentHolding.lots !== latestMap[stockId].lots) {
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
    const currentYear = dashboardYear;
    const prevYear = dashboardYear - 1;

    const totalCurrent = data.filter(d => d.year === currentYear).reduce((sum, d) => sum + (d.total || 0), 0);
    const totalPrev = data.filter(d => d.year === prevYear).reduce((sum, d) => sum + (d.total || 0), 0);
    const totalAll = data.reduce((sum, d) => sum + (d.total || 0), 0);
    
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const inCurrent = data.filter(d => d.year === currentYear && d.month === month).reduce((sum, d) => sum + d.total, 0);
        const inPrev = data.filter(d => d.year === prevYear && d.month === month).reduce((sum, d) => sum + d.total, 0);
        return {
            name: `${month}月`,
            [currentYear]: inCurrent,
            [prevYear]: inPrev
        };
    });

    const stockMap = {};
    data.forEach(d => {
        if (!stockMap[d.stockId]) stockMap[d.stockId] = 0;
        stockMap[d.stockId] += d.total;
    });
    const stockData = Object.keys(stockMap)
        .map(key => ({ name: key, value: stockMap[key] }))
        .sort((a, b) => b.value - a.value);

    return { totalCurrent, totalPrev, totalAll, monthlyData, stockData, currentYear, prevYear };
  }, [data, dashboardYear]); 


  // --- Render ---

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 relative">
      
      {/* 彈出式安裝教學 Modal */}
      {showInstallGuide && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-blue-600" />
                          將程式安裝到桌面/主畫面
                      </h3>
                      <button onClick={() => setShowInstallGuide(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-6 space-y-4 text-sm text-slate-600">
                      <p className="font-medium text-slate-800">只需幾個步驟，就能讓它變成獨立 APP：</p>
                      
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <p className="font-bold text-blue-800 mb-2">📱 在 iPhone / iPad 上 (Safari)：</p>
                          <ol className="list-decimal pl-5 space-y-1">
                              <li>點擊瀏覽器底部的 <span className="inline-block border border-slate-300 rounded px-1 bg-white">分享圖示</span> (有向上箭頭的方塊)。</li>
                              <li>往下滑動，選擇 <strong>「加入主畫面」</strong>。</li>
                              <li>點擊右上角「新增」即可！</li>
                          </ol>
                      </div>

                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                          <p className="font-bold text-emerald-800 mb-2">💻 在電腦 / Android 手機上 (Chrome)：</p>
                          <ol className="list-decimal pl-5 space-y-1">
                              <li>點擊 Chrome 右上角的 <strong>⋮ 選單</strong>。</li>
                              <li>選擇 <strong>「儲存並分享」</strong> (Save and share)。</li>
                              <li>點擊 <strong>「安裝網頁為應用程式」</strong> 即可！</li>
                              <li className="text-xs text-emerald-600 mt-1">* 舊版 Chrome 可能直接顯示「安裝存股配息管家」或「加到主畫面」。</li>
                          </ol>
                      </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button onClick={() => setShowInstallGuide(false)} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          我知道了
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent hidden sm:block">
              存股配息管家
            </h1>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* 安裝 APP 按鈕 */}
            <button 
                onClick={handleInstallApp}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
                <Download className="w-4 h-4" />
                安裝 App
            </button>

            <span className="hidden md:flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
               <Users className="w-3 h-3" /> 共用資料庫
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
                title={`${stats.currentYear} 總領股息 (當年)`}
                value={`$${stats.totalCurrent.toLocaleString()}`} 
                subtext="已實現損益"
                icon={DollarSign}
                colorClass="text-emerald-600"
            />
            <StatCard 
                title={`${stats.prevYear} 總領股息 (去年)`}
                value={`$${stats.totalPrev.toLocaleString()}`} 
                subtext={stats.totalCurrent > stats.totalPrev 
                    ? `今年比去年成長 $${(stats.totalCurrent - stats.totalPrev).toLocaleString()}` 
                    : `今年比去年減少 $${(stats.totalPrev - stats.totalCurrent).toLocaleString()}`}
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
                        <h3 className="text-lg font-bold text-slate-800">每月現金流比較 ({stats.prevYear} vs {stats.currentYear})</h3>
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
                                <Bar dataKey={stats.prevYear} name={`${stats.prevYear} 配息 (去年)`} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey={stats.currentYear} name={`${stats.currentYear} 配息 (當年)`} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart & Empty State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">ETF 貢獻佔比 (歷史總計)</h3>
                        <div className="flex-1 flex flex-col items-center">
                             {stats.stockData.length > 0 ? (
                                <>
                                <div className="h-64 w-full">
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
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full mt-4 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                    {stats.stockData.map((entry, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                <span className="font-medium text-slate-600">{entry.name}</span>
                                            </div>
                                            <span className="text-slate-800 font-bold">${entry.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                </>
                             ) : (
                                 <div className="text-slate-400 text-sm h-64 flex items-center justify-center">尚無資料，請先匯入數據</div>
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
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="例如: 00878"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                        value={formData.stockId}
                                        onChange={(e) => setFormData({...formData, stockId: e.target.value})}
                                        required
                                    />
                                    {formData.stockId.length >= 4 && (
                                        <button
                                            type="button"
                                            onClick={openYahooFinance}
                                            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 whitespace-nowrap text-xs font-medium border border-blue-100"
                                            title="查詢最新配息資訊"
                                        >
                                            <Search className="w-3 h-3" />
                                            查配息
                                        </button>
                                    )}
                                </div>
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
                                        onChange={handleDividendChange}
                                        required
                                        min="0"
                                    />
                                    {autoFilled ? (
                                        <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1 animate-pulse">
                                            <Sparkles className="w-3 h-3" /> 已自動帶入歷史配息
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 mt-1">請輸入每1000股配息金額</p>
                                    )}
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