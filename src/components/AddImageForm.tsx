/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Upload, Link2, LayoutGrid, Check, Plus, AlertCircle } from 'lucide-react';
import { PRESET_ITEMS, PresetItem } from '../presets';

interface AddImageFormProps {
  onAddImage: (title: string, url: string) => void;
}

export default function AddImageForm({ onAddImage }: AddImageFormProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError('يرجى كتابة عنوان أو اسم للصورة');
      return;
    }
    if (!imageUrl.trim()) {
      setUploadError('يرجى وضع رابط الصورة');
      return;
    }
    onAddImage(title.trim(), imageUrl.trim());
    setTitle('');
    setImageUrl('');
    setUploadError('');
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('عذراً، الملف المختار يجب أن يكون صورة');
      return;
    }
    // Limit local upload size to 1MB to respect localstorage/firestore limits
    if (file.size > 1048576) {
      setUploadError('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 1 ميجابايت لضمان سرعة الحفظ والمزامنة.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      if (base64Url) {
        onAddImage(file.name.split('.')[0] || 'صورة محملة', base64Url);
        setUploadError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-md transition-all duration-300">
      <h2 className="text-xl font-bold text-slate-800 dark:text-neutral-100 mb-5 text-right flex items-center justify-end gap-2.5">
        <span>إضافة صورة جديدة للعداد</span>
        <Plus className="w-5 h-5 text-indigo-500" />
      </h2>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-neutral-950 rounded-2xl mb-6">
        <button
          onClick={() => { setActiveTab('presets'); setUploadError(''); }}
          className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'presets'
              ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">النماذج الجاهزة</span>
          <span className="sm:hidden text-xs">نماذج</span>
        </button>

        <button
          onClick={() => { setActiveTab('upload'); setUploadError(''); }}
          className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">تحميل ملف</span>
          <span className="sm:hidden text-xs">تحميل</span>
        </button>

        <button
          onClick={() => { setActiveTab('url'); setUploadError(''); }}
          className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'url'
              ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span className="hidden sm:inline">رابط صورة</span>
          <span className="sm:hidden text-xs">رابط</span>
        </button>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-150 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2 text-right justify-end">
          <span>{uploadError}</span>
          <AlertCircle className="w-4 h-4 shrink-0" />
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[140px]">
        {activeTab === 'presets' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {PRESET_ITEMS.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  onAddImage(preset.title, preset.url);
                  setUploadError('');
                }}
                className="group relative h-24 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md text-right transition-all duration-200"
              >
                <img
                  src={preset.url}
                  alt={preset.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[10px] text-indigo-400 font-medium">{preset.category}</span>
                  <span className="text-xs font-bold text-white line-clamp-1">{preset.title}</span>
                </div>
                <div className="absolute top-2 right-2 p-1 bg-indigo-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-3 h-3" />
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-250 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10'
                  : 'border-slate-200 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-800'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Upload className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-indigo-500 animate-bounce' : 'text-slate-400'}`} />
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300 text-center">
                اسحب الصورة وأفلتها هنا، أو اضغط للتصفح
              </p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 text-center mt-1">
                يدعم صيغ JPG، PNG، WEBP (الحد الأقصى: 1 ميجابايت)
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'url' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 text-right mb-1.5">
                  اسم أو عنوان الصورة
                </label>
                <input
                  type="text"
                  placeholder="مثال: حاسوبي المكتبي"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-right p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 text-right mb-1.5">
                  رابط عنوان الصورة المباشر (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white text-sm"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 transition-all flex items-center justify-center gap-2"
              >
                <span>إضافة الصورة الآن</span>
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
