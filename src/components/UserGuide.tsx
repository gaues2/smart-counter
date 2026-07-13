/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Image, PlusCircle, RefreshCw, FileDown, CloudLightning } from 'lucide-react';

export default function UserGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-right font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
        id="user-guide-toggle"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-indigo-500 animate-pulse" />
          <span className="font-semibold text-base">دليل الاستخدام السريع والتوضيحي</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-250 dark:border-neutral-850 pt-4 divide-y divide-slate-100 dark:divide-neutral-850">
          <div className="flex gap-3 pt-2">
            <Image className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">1. إضافة الصور وإدارتها</h4>
              <p>يمكنك إضافة صور جديدة بطرق متعددة: رفع ملف صورة من جهازك، أو لصق رابط صورة مباشرة، أو تصفح واختيار أحد النماذج الجاهزة لتوفير الوقت.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <PlusCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">2. عداد الكمية المستقل</h4>
              <p>كل صورة يتم إضافتها تظهر بشكل مستقل مع عداد خاص بها. استخدم أزرار (+) لزيادة العدد و (-) لتقليله، أو اكتب الرقم مباشرة داخل حقل الإدخال.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <FileDown className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">3. تصدير البيانات والملخص الإجمالي</h4>
              <p>يعرض الشريط العلوي الإجمالي الكلي للقطع المضافة. يمكنك تصدير تقرير تفصيلي كملف PDF منسق للطباعة، أو ملف CSV لفتحه ببرامج الجداول كـ Excel.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <RefreshCw className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">4. الحفظ التلقائي وإعادة التعيين</h4>
              <p>يقوم التطبيق بحفظ جميع بياناتك تلقائياً على المتصفح المحلي لضمان عدم ضياع مجهودك. كما يمكنك الضغط على زر "إعادة التعيين" لتصفير العدادات أو "مسح الكل" للبدء من جديد مع نافذة تأكيد آمنة.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <CloudLightning className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">5. المزامنة والنسخ الاحتياطي السحابي</h4>
              <p>لحماية بياناتك ومزامنتها عبر جميع أجهزتك فوراً، قم بتسجيل الدخول بحساب Google من خلال قسم المزامنة السحابية. بمجرد الدخول، سيتم رفع التحديثات ومزامنتها تلقائياً.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
