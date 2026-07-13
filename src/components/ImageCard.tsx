/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Trash2, Calendar, Edit2, Check } from 'lucide-react';
import { ImageItem } from '../types';

interface ImageCardProps {
  key?: string;
  item: ImageItem;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export default function ImageCard({ item, onUpdateQuantity, onDelete, onRename }: ImageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [pulseBadge, setPulseBadge] = useState(false);

  // Trigger pulse effect on quantity change
  useEffect(() => {
    setPulseBadge(true);
    const timer = setTimeout(() => setPulseBadge(false), 300);
    return () => clearTimeout(timer);
  }, [item.quantity]);

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 0) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateQuantity(item.id, val);
    } else if (e.target.value === '') {
      onUpdateQuantity(item.id, 0);
    }
  };

  const saveRename = () => {
    if (editTitle.trim()) {
      onRename(item.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-neutral-950 overflow-hidden">
        <img
          src={item.url}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        {/* Floating Quantity Badge */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ scale: pulseBadge ? 1.25 : 1 }}
            className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 ${
              item.quantity > 0 
                ? 'bg-indigo-600 text-white shadow-indigo-500/20' 
                : 'bg-neutral-950/85 text-neutral-300 border border-neutral-800'
            }`}
          >
            <span className="text-xs">الكمية:</span>
            <span>{item.quantity}</span>
          </motion.div>
        </div>

        {/* Delete Button (floating on hover) */}
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-4 left-4 p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg opacity-90 hover:opacity-100 transition-all duration-200 transform active:scale-95"
          title="حذف الصورة"
          id={`delete-${item.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow text-right">
        <div className="flex items-start justify-between gap-2 mb-3">
          {isEditing ? (
            <div className="flex gap-1 w-full">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                className="w-full text-right border-b border-indigo-500 focus:outline-none py-0.5 text-sm font-semibold text-slate-800 dark:text-white bg-transparent"
                autoFocus
              />
              <button
                onClick={saveRename}
                className="p-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/title">
              <h3 className="font-semibold text-slate-800 dark:text-neutral-100 text-base line-clamp-1">
                {item.title}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                title="تعديل الاسم"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Date added */}
        <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs mb-5">
          <Calendar className="w-3.5 h-3.5" />
          <span>أُضيفت {new Date(item.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Counter Action Panel */}
        <div className="mt-auto flex items-center justify-between bg-slate-50 dark:bg-neutral-950 p-2 rounded-2xl border border-slate-100 dark:border-neutral-800">
          <button
            onClick={handleIncrement}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/10 transition-all duration-150"
            id={`inc-${item.id}`}
          >
            <Plus className="w-5 h-5" />
          </button>

          <input
            type="number"
            value={item.quantity === 0 ? '' : item.quantity}
            placeholder="0"
            onChange={handleInputChange}
            className="w-16 text-center font-bold text-lg bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-white"
            id={`input-${item.id}`}
          />

          <button
            onClick={handleDecrement}
            disabled={item.quantity === 0}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-150 ${
              item.quantity > 0
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                : 'bg-slate-100 text-slate-300 dark:bg-neutral-800/40 dark:text-neutral-600 cursor-not-allowed'
            }`}
            id={`dec-${item.id}`}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
