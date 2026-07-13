/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cloud, CloudLightning, CloudOff, RefreshCw, LogIn, LogOut, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getFirebase, signInWithGoogle, signOutUser, listenToAuth, backupToCloud, restoreFromCloud } from '../firebaseClient';
import { ImageItem } from '../types';

interface CloudSyncPanelProps {
  localItems: ImageItem[];
  onRestoreItems: (items: ImageItem[]) => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CloudSyncPanel({ localItems, onRestoreItems, onShowNotification }: CloudSyncPanelProps) {
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  // Check firebase availability and watch auth state
  useEffect(() => {
    let unsubscribe: any = null;
    
    async function setup() {
      const { available } = await getFirebase();
      setFirebaseAvailable(available);
      
      if (available) {
        unsubscribe = await listenToAuth((currentUser) => {
          setUser(currentUser);
        });
      }
    }

    setup();

    // Recover last sync from localStorage
    const savedLastSync = localStorage.getItem('last_cloud_sync_timestamp');
    if (savedLastSync) {
      setLastSync(parseInt(savedLastSync, 10));
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onShowNotification('تم تسجيل الدخول بنجاح عبر حساب Google!', 'success');
    } catch (e: any) {
      console.error(e);
      onShowNotification('عذراً، فشل تسجيل الدخول. يرجى المحاولة لاحقاً.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      onShowNotification('تم تسجيل الخروج بنجاح.', 'info');
    } catch (e: any) {
      console.error(e);
      onShowNotification('خطأ أثناء تسجيل الخروج.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const timestamp = await backupToCloud(localItems);
      setLastSync(timestamp);
      localStorage.setItem('last_cloud_sync_timestamp', timestamp.toString());
      onShowNotification('تم حفظ النسخة الاحتياطية سحابياً ومزامنة جميع العناصر!', 'success');
    } catch (e: any) {
      console.error(e);
      onShowNotification('فشلت المزامنة السحابية. تأكد من اتصالك وقواعد الحماية.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    if (localItems.length > 0) {
      const confirmRestore = window.confirm("هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيؤدي ذلك إلى استبدال القائمة المحلية الحالية بالكامل.");
      if (!confirmRestore) return;
    }
    
    setSyncing(true);
    try {
      const cloudItems = await restoreFromCloud();
      if (cloudItems.length === 0) {
        onShowNotification('لم يتم العثور على أي بيانات سحابية محفوظة لحسابك.', 'info');
      } else {
        onRestoreItems(cloudItems);
        onShowNotification(`تم استعادة ${cloudItems.length} صورة بنجاح من السحابة!`, 'success');
      }
    } catch (e: any) {
      console.error(e);
      onShowNotification('فشل استعادة البيانات من السحابة.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-md transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-4 mb-4 text-right">
        <div className="flex items-center gap-2">
          {firebaseAvailable ? (
            <CloudLightning className="w-5 h-5 text-indigo-500" />
          ) : (
            <CloudOff className="w-5 h-5 text-slate-400" />
          )}
          <span className="font-bold text-lg text-slate-800 dark:text-slate-100">النسخ الاحتياطي السحابي</span>
        </div>
        <span className="text-xs bg-slate-100 dark:bg-neutral-950 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-medium">
          مزامنة فورية
        </span>
      </div>

      {!firebaseAvailable ? (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl flex items-start gap-3 text-right">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
              <p className="font-bold mb-1">الوضع المحلي نشط حالياً</p>
              <p>يتم حفظ بياناتك تلقائياً على متصفحك بشكل آمن. لتنشيط النسخ الاحتياطي والمزامنة السحابية الفورية عبر أجهزتك، سيقوم النظام الآن بطلب تفويض لإعداد السحابة.</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-right">
            💡 بمجرد اكتمال إعداد السحابة في الخلفية، ستتمكن من تسجيل الدخول بحساب Google ومزامنة كافة العدادات والكميات والصور فوراً.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!user ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 text-center">
                قم بتسجيل الدخول لحفظ نسخة احتياطية من صورك وكمياتها واستعادتها في أي وقت عبر أجهزة متعددة.
              </p>
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-md active:scale-95 transition shadow-indigo-500/10"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول بحساب Google</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User profile banner */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-100 dark:border-neutral-800">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.displayName || 'مستخدم السحابة'}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center font-bold rounded-full">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>

              {/* Synchronize actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRestore}
                  disabled={syncing}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-slate-100 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>استيراد السحابة</span>
                </button>

                <button
                  onClick={handleBackup}
                  disabled={syncing}
                  className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-500/15"
                >
                  <Cloud className="w-4 h-4" />
                  <span>نسخ احتياطي الآن</span>
                </button>
              </div>

              {/* Last synchronized */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
                {lastSync ? (
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(lastSync).toLocaleTimeString('ar-EG')} - {new Date(lastSync).toLocaleDateString('ar-EG')}
                  </span>
                ) : (
                  <span>لم يتم الرفع مسبقاً</span>
                )}
                <div className="flex items-center gap-1">
                  <span>آخر مزامنة ناجحة</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
