import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Globe, Clock, Share2, FileText, Check } from 'lucide-react';
import { ConvertedTimeInfo, FacebookPage, TimezoneConfig } from '../types';
import { TARGET_TIMEZONES } from '../data/timezones';
import { saveStoredPages } from '../utils/storage';

interface FacebookPagesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FacebookPage[];
  onUpdatePages: (pages: FacebookPage[]) => void;
  convertedMap: Record<string, ConvertedTimeInfo>;
  timeFormat: '12h' | '24h';
  initialSelectedIana?: string;
}

export const FacebookPagesManager: React.FC<FacebookPagesManagerProps> = ({
  isOpen,
  onClose,
  pages,
  onUpdatePages,
  convertedMap,
  timeFormat,
  initialSelectedIana,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [timezoneId, setTimezoneId] = useState<string>(
    initialSelectedIana
      ? (TARGET_TIMEZONES.find((t) => t.iana === initialSelectedIana)?.id || 'uk_london')
      : 'uk_london'
  );
  const [category, setCategory] = useState<string>('General News');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setTimezoneId('uk_london');
    setCategory('General News');
    setNotes('');
  };

  const handleStartEdit = (page: FacebookPage) => {
    setIsEditing(true);
    setEditingId(page.id);
    setName(page.name);
    setTimezoneId(page.timezoneId);
    setCategory(page.category || 'General News');
    setNotes(page.notes || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      // update
      const updated = pages.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: name.trim(),
              timezoneId,
              category: category.trim(),
              notes: notes.trim(),
            }
          : p
      );
      onUpdatePages(updated);
      saveStoredPages(updated);
    } else {
      // create
      const newPage: FacebookPage = {
        id: `page_${Date.now()}`,
        name: name.trim(),
        timezoneId,
        category: category.trim(),
        notes: notes.trim(),
        createdAt: Date.now(),
      };
      const updated = [newPage, ...pages];
      onUpdatePages(updated);
      saveStoredPages(updated);
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = pages.filter((p) => p.id !== id);
    onUpdatePages(updated);
    saveStoredPages(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Facebook Page Assignments
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assign your Facebook pages to target country timezones for easy reference.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Add / Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSave} className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Facebook Page' : 'Add New Facebook Page'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My UK News Page"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Timezone
                  </label>
                  <select
                    value={timezoneId}
                    onChange={(e) => setTimezoneId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {TARGET_TIMEZONES.map((tz) => (
                      <option key={tz.id} value={tz.id}>
                        {tz.flag} {tz.label} ({tz.iana})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. News, E-Commerce, Entertainment"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Scheduling Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best engagement 7 PM London time"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Add Page'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartAdd}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add New Facebook Page</span>
            </button>
          )}

          {/* List of Pages */}
          <div className="space-y-2.5">
            {pages.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No Facebook pages assigned yet. Add one above to keep track of your pages!
              </div>
            ) : (
              pages.map((page) => {
                const tz = TARGET_TIMEZONES.find((t) => t.id === page.timezoneId) || TARGET_TIMEZONES[0];
                const info = tz ? convertedMap[tz.iana] : null;
                const localTime = info
                  ? timeFormat === '12h'
                    ? info.timeString12
                    : info.timeString24
                  : '--:--';

                return (
                  <div
                    key={page.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tz?.flag || '🌐'}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {page.name}
                        </h4>
                        {page.category && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {page.category}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {tz?.label}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                          Local: {localTime}
                        </span>
                        {info && (
                          <>
                            <span>·</span>
                            <span>{info.diffText}</span>
                          </>
                        )}
                      </div>

                      {page.notes && (
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                          "{page.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        onClick={() => handleStartEdit(page)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-750 dark:hover:text-white"
                        title="Edit Page"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Delete Page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
