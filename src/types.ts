/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImageItem {
  id: string;
  title: string;
  url: string;
  quantity: number;
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  items: ImageItem[];
  theme: 'light' | 'dark';
  lastSyncedAt?: number;
}
