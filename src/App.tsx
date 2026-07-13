/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  FileDown, 
  RefreshCw, 
  Moon, 
  Sun, 
  Search, 
  Sparkles, 
  FolderMinus, 
  X, 
  Database, 
  Check, 
  TrendingUp, 
  FolderPlus,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { ImageItem } from './types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ImageCard from './components/ImageCard';
import AddImageForm from './components/AddImageForm';
import CloudSyncPanel from './components/CloudSyncPanel';
import UserGuide from './components/UserGuide';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

const STORAGE_KEY = 'smart_image_counter_items_v1';
const THEME_KEY = 'smart_image_counter_theme_v1';

// Initial beautiful sample items to present a completed and lively UI on first boot
const DEFAULT_ITEMS: ImageItem[] = [
  {
    id: 'sample-laptop',
    title: 'حاسوب محمول ذكي',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
    quantity: 1,
    createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
    updatedAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: 'sample-headphones',
    title: 'سماعات عازلة للضوضاء',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
    quantity: 2,
    createdAt: Date.now() - 3600000 * 24 * 2, // 2 days ago
    updatedAt: Date.now() - 3600000 * 24 * 2
  },
  {
    id: 'sample-mug',
    title: 'كوب قهوة سيراميك',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80',
    quantity: 5,
    createdAt: Date.now() - 3600000 * 5, // 5 hours ago
    updatedAt: Date.now() - 3600000 * 5
  }
];

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'quantity' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'info'
  });

  // Custom confirm wrapper
  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info',
    confirmText = 'تأكيد',
    cancelText = 'إلغاء'
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      confirmText,
      cancelText,
      type
    });
  };

  // 1. Load initial values (LocalStorage and Theme)
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Data load
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setItems(JSON.parse(savedData));
      } catch (e) {
        console.error("Error reading data, loading presets.", e);
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
  }, []);

  // 2. Auto-save data on changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [items]);

  // Toast Notification Trigger
  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showNotification(newTheme === 'dark' ? 'تم تنشيط الوضع الليلي 🌙' : 'تم تنشيط الوضع المضيء ☀️', 'info');
  };

  // Add custom or preset image
  const handleAddImage = (title: string, url: string) => {
    const newItem: ImageItem = {
      id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      title,
      url,
      quantity: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setItems((prev) => [newItem, ...prev]);
    showNotification(`تمت إضافة "${title}" بنجاح!`, 'success');
  };

  // Update image count quantity
  const handleUpdateQuantity = (id: string, newQty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty, updatedAt: Date.now() } : item
      )
    );
  };

  // Rename image item title
  const handleRenameItem = (id: string, newTitle: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, title: newTitle, updatedAt: Date.now() } : item
      )
    );
    showNotification('تم تحديث اسم الصورة بنجاح', 'success');
  };

  // Delete individual image card
  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) return;

    triggerConfirm(
      'تأكيد حذف الصورة',
      `هل أنت متأكد من حذف الصورة "${itemToDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة البيانات المرتبطة بها.`,
      () => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        showNotification(`تم حذف الصورة "${itemToDelete.title}" بنجاح.`, 'info');
      },
      'danger',
      'نعم، احذفها',
      'إلغاء'
    );
  };

  // Reset all quantities to 0
  const handleResetAllQuantities = () => {
    if (items.length === 0) return;
    triggerConfirm(
      'تصفير كافة العدادات',
      'هل أنت متأكد من إعادة تعيين العدادات وتصفير الكميات لجميع الصور والمنتجات المسجلة؟',
      () => {
        setItems((prev) => prev.map((item) => ({ ...item, quantity: 0, updatedAt: Date.now() })));
        showNotification('تم تصفير جميع عدادات الصور بنجاح 🔄', 'success');
      },
      'warning',
      'نعم، قم بالتصفير',
      'إلغاء'
    );
  };

  // Clear/Wipe all items
  const handleClearAll = () => {
    if (items.length === 0) return;
    triggerConfirm(
      'مسح كافة البيانات',
      '⚠️ تنبيه هام: هل أنت متأكد من مسح جميع الصور والبيانات والعدادات نهائياً؟ لا يمكن التراجع عن هذا الإجراء مطلقاً.',
      () => {
        setItems([]);
        showNotification('تم مسح جميع بيانات الصور والكميات بنجاح!', 'error');
      },
      'danger',
      'نعم، امسح الكل',
      'إلغاء'
    );
  };

  // Restore or pull backup from Firebase Cloud
  const handleRestoreFromCloud = (cloudItems: ImageItem[]) => {
    setItems(cloudItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudItems));
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (items.length === 0) {
      showNotification('لا توجد بيانات لتصديرها!', 'error');
      return;
    }
    try {
      let csvContent = "\uFEFF"; // UTF-8 BOM for perfect Excel Arabic encoding
      csvContent += "الرقم,اسم الصورة أو العنصر,الكمية المضافة,تاريخ الإضافة\n";

      items.forEach((item, index) => {
        const dateStr = new Date(item.createdAt).toLocaleDateString('ar-EG');
        const row = [
          index + 1,
          `"${item.title.replace(/"/g, '""')}"`,
          item.quantity,
          `"${dateStr}"`
        ].join(",");
        csvContent += row + "\n";
      });

      // Sum Row
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      csvContent += `\n,,,\n,,إجمالي الكميات الكلي,${totalQty}\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `تقرير_كميات_الصور_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('تم تصدير تقرير CSV بنجاح!', 'success');
    } catch (e) {
      console.error(e);
      showNotification('فشل تصدير ملف CSV.', 'error');
    }
  };

  // Export to PDF Function (Fixed for Arabic Support)
  const handleExportPDF = async () => {
    if (items.length === 0) {
      showNotification('لا توجد بيانات لتصديرها!', 'error');
      return;
    }
    try {
      showNotification('جاري تجهيز ملف PDF...', 'info');
      
      // 1. Create a temporary HTML container for our report
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px'; // Hide it off-screen
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '40px';
      container.style.direction = 'rtl'; // Right-to-left for Arabic
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      
      // 2. Build the HTML content
      let html = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0 0 10px 0; font-size: 28px;">تقرير كميات الصور</h1>
          <p style="color: #64748b; margin: 0; font-size: 14px;">تاريخ التقرير: ${new Date().toLocaleString('ar-EG')}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 12px; font-weight: bold; color: #334155;">م</th>
              <th style="padding: 12px; font-weight: bold; color: #334155;">اسم الصورة / العنصر</th>
              <th style="padding: 12px; font-weight: bold; color: #334155;">الكمية</th>
              <th style="padding: 12px; font-weight: bold; color: #334155;">تاريخ الإضافة</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      items.forEach((item, index) => {
        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px; color: #64748b;">${index + 1}</td>
              <td style="padding: 12px; font-weight: bold; color: #0f172a;">${item.title}</td>
              <td style="padding: 12px; font-weight: bold; color: #4f46e5;">${item.quantity}</td>
              <td style="padding: 12px; color: #64748b;">${new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
            </tr>
        `;
      });
      
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      
      html += `
          </tbody>
        </table>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: #0f172a;">
          <div>إجمالي الصور الفريدة: ${items.length}</div>
          <div style="color: #4f46e5;">إجمالي الكميات الكلي: ${totalQty}</div>
        </div>
      `;
      
      container.innerHTML = html;
      document.body.appendChild(container);
      
      // 3. Convert HTML to Canvas using html2canvas
      const canvas = await html2canvas(container, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false
      });
      
      // Clean up the DOM
      document.body.removeChild(container);
      
      // 4. Put the Canvas Image into jsPDF
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`تقرير_الكميات_${Date.now()}.pdf`);
      
      showNotification('تم تصدير ملف PDF بنجاح للطباعة!', 'success');
    } catch (e) {
      console.error(e);
      showNotification('فشل تصدير ملف PDF.', 'error');
    }
  };

  // Statistics Computations
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const activeCount = items.filter((item) => item.quantity > 0).length;

  // Filter & Sort Images
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title, 'ar');
    } else if (sortBy === 'quantity') {
      comparison = a.quantity - b.quantity;
    } else {
      comparison = a.createdAt - b.createdAt;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-slate-800 dark:text-neutral-200 font-sans transition-colors duration-300 pb-16" dir="rtl">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -30, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-center justify-between gap-4 text-right ${
                toast.type === 'success'
                  ? 'bg-indigo-600/95 dark:bg-indigo-950/90 border-indigo-500/30 text-white'
                  : toast.type === 'error'
                  ? 'bg-rose-500/90 dark:bg-rose-950/90 border-rose-500/30 text-white'
                  : 'bg-neutral-900/95 dark:bg-neutral-900/90 border-neutral-700/50 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold leading-relaxed">{toast.text}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-right">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                عداد كميات الصور <span className="text-indigo-600 dark:text-indigo-400">الذكي</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                إصدار متطور مع حزمة أدوات Bento المبتكرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 rounded-2xl active:scale-95 transition-all"
              title="تبديل الوضع"
              id="theme-toggle"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-neutral-800"></div>
            
            <span className="text-xs bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-3.5 py-2 rounded-xl font-bold border border-indigo-100 dark:border-indigo-900/30">
              مزامنة سحابية نشطة
            </span>
          </div>
        </header>

        {/* Dynamic Bento-Grid Dashboard Counters */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Total Quantities */}
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-start">
              <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">إجمالي كمية المخزون</p>
              <TrendingUp className="w-5 h-5 text-indigo-200" />
            </div>
            <h3 className="text-5xl font-black leading-none my-2">{totalQuantity}</h3>
            <p className="text-xs text-indigo-200">مجموع الوحدات والكميات لجميع العناصر المضافة</p>
          </div>

          {/* Card 2: Unique Images */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-950 px-3 py-1 rounded-full">الصور الفريدة والنشطة</span>
              <FolderPlus className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{items.length}</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                منها <span className="font-bold text-indigo-500 dark:text-indigo-400">{activeCount}</span> عناصر نشطة في العد
              </p>
            </div>
          </div>

          {/* Card 3: Summary Progress Preview */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-between min-h-[160px]">
            <h4 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">النسبة المئوية للعناصر الأكثر عدداً</h4>
            <div className="space-y-2.5 max-h-[90px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">لا توجد صور مضافة حالياً لعرض إحصاءاتها</p>
              ) : (
                [...items]
                  .sort((a, b) => b.quantity - a.quantity)
                  .slice(0, 3)
                  .map((item) => {
                    const percentage = totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0;
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{item.title}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono">{item.quantity} وحدة ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-neutral-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </section>

        {/* Application Functional Bento-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Active List, Add Image, Filters */}
          <main className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions & Search Area */}
            <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث عن صورة باسمها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-right pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white text-sm"
                  id="search-input"
                />
              </div>

              {/* Sorting and Controls */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-neutral-950 p-1 rounded-xl">
                  <button
                    onClick={() => setSortBy('createdAt')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      sortBy === 'createdAt' 
                        ? 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    التاريخ
                  </button>
                  <button
                    onClick={() => setSortBy('quantity')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      sortBy === 'quantity' 
                        ? 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    الكمية
                  </button>
                  <button
                    onClick={() => setSortBy('title')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      sortBy === 'title' 
                        ? 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    الاسم
                  </button>
                </div>

                <button
                  onClick={toggleSortOrder}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 rounded-xl transition text-slate-600 dark:text-slate-300"
                  title={sortOrder === 'asc' ? 'ترتيب تنازلي' : 'ترتيب تصاعدي'}
                  id="sort-order-toggle"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List and Cards Section */}
            {sortedItems.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
                  <FolderMinus className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-2">عذراً، لم نجد أي صور</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mb-6">
                  {searchQuery 
                    ? `لا توجد نتائج تطابق بحثك عن "${searchQuery}". يرجى تجربة كلمات أخرى.` 
                    : 'القائمة فارغة حالياً. قم بإضافة صورة جديدة من النماذج الجاهزة أو حمل ملفاً للبدء بالعد.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm rounded-xl transition active:scale-95"
                  >
                    إلغاء الفلترة والبحث
                  </button>
                )}
              </div>
            ) : (
              <motion.div 
                layout 
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                id="image-grid"
              >
                <AnimatePresence mode="popLayout">
                  {sortedItems.map((item) => (
                    <ImageCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onDelete={handleDeleteItem}
                      onRename={handleRenameItem}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Add Image Component Panel */}
            <AddImageForm onAddImage={handleAddImage} />
            
          </main>

          {/* Column 3: Sidebar Controls (Cloud, Guide, Global actions) */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* User Guide Interactive Accordion */}
            <UserGuide />

            {/* Cloud Backup and Instant Sync Panel */}
            <CloudSyncPanel 
              localItems={items} 
              onRestoreItems={handleRestoreFromCloud}
              onShowNotification={showNotification}
            />

            {/* Backup & Administration Tools Card */}
            <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-md space-y-5 transition-all">
              <h3 className="font-bold text-base text-slate-800 dark:text-neutral-100 border-b border-slate-100 dark:border-neutral-800 pb-3 text-right">
                أدوات التحكم والتقارير
              </h3>

              {/* Reset/Clear section */}
              <div className="space-y-3">
                <button
                  onClick={handleResetAllQuantities}
                  disabled={items.length === 0}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-amber-50 dark:bg-neutral-950 dark:hover:bg-amber-950/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-100 dark:border-slate-850 rounded-2xl font-bold text-sm transition-all flex items-center justify-between active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  id="reset-all-quantities"
                >
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <span>تصفير وإعادة تعيين العدادات</span>
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={items.length === 0}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-rose-50 dark:bg-neutral-950 dark:hover:bg-rose-950/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-100 dark:border-slate-850 rounded-2xl font-bold text-sm transition-all flex items-center justify-between active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  id="clear-all-data"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>مسح جميع الصور والبيانات</span>
                </button>
              </div>

              <div className="h-px bg-slate-100 dark:bg-neutral-800"></div>

              {/* Export/Reports section */}
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 text-right">أرشفة وحفظ التقارير كملفات تفصيلية:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportCSV}
                    disabled={items.length === 0}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-slate-150 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="export-csv"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>تصدير CSV</span>
                  </button>

                  <button
                    onClick={handleExportPDF}
                    disabled={items.length === 0}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-slate-150 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="export-pdf"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>تصدير PDF</span>
                  </button>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 w-full max-w-md rounded-3xl p-6 shadow-2xl text-right overflow-hidden relative"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  confirmDialog.type === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                    : confirmDialog.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                    : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl transition active:scale-95"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className={`px-5 py-2.5 text-white font-bold text-sm rounded-xl transition active:scale-95 ${
                    confirmDialog.type === 'danger'
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/10'
                      : confirmDialog.type === 'warning'
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/10'
                  }`}
                  id="confirm-modal-ok"
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
