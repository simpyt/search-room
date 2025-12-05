'use client';

import type { DragEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isHomegateTheme } from '@/lib/theme';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  color: string;
}

interface DocumentItem {
  id: string;
  originalName: string;
  displayName: string;
  version: number;
  size: string;
  uploadedAt: string;
  type: string;
  previewUrl?: string;
  propertyTag?: string;
  sharedWith: string[];
}

const ROLE_OPTIONS = [
  'Notary',
  'Mortgage Advisor',
  'Banker',
  'Construction Consultant',
  'Real Estate Expert',
  'Lawyer',
  'Insurance Specialist',
  'Architect',
];

const CONTACT_COLORS = ['#f472b6', '#60a5fa', '#34d399', '#c084fc', '#fb923c', '#38bdf8'];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 KB';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'notary-nora',
    name: 'Nora Meier',
    role: 'Notary',
    email: 'nora.meier@trustedlaw.ch',
    phone: '+41 79 555 23 81',
    color: CONTACT_COLORS[0],
  },
  {
    id: 'mortgage-marc',
    name: 'Marc Keller',
    role: 'Mortgage Advisor',
    email: 'marc.keller@alpcredit.ch',
    phone: '+41 79 910 44 12',
    color: CONTACT_COLORS[1],
  },
  {
    id: 'banker-laura',
    name: 'Laura Rossi',
    role: 'Banker',
    email: 'laura.rossi@helveticbank.ch',
    phone: '+41 44 890 22 10',
    color: CONTACT_COLORS[2],
  },
];

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-valuation',
    originalName: 'Property-Valuation.pdf',
    displayName: 'Property Valuation',
    version: 2,
    size: '1.8 MB',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    type: 'application/pdf',
    propertyTag: 'Riverside Loft',
    sharedWith: ['notary-nora', 'mortgage-marc'],
  },
  {
    id: 'doc-application',
    originalName: 'Application-Form.pdf',
    displayName: 'Application Form',
    version: 1,
    size: '940 KB',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    type: 'application/pdf',
    propertyTag: 'Lakeview Terrace',
    sharedWith: ['mortgage-marc'],
  },
  {
    id: 'doc-renovation',
    originalName: 'Renovation-Estimate.xlsx',
    displayName: 'Renovation Estimate',
    version: 3,
    size: '2.4 MB',
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    type: 'application/vnd.ms-excel',
    sharedWith: [],
  },
];

type SortOption = 'date' | 'name' | 'size' | 'version';
type FilterOption = 'all' | 'pdf' | 'excel' | 'word' | 'image';

const FileIcon = ({ type, className }: { type: string; className?: string }) => {
  if (type.startsWith('image/')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    );
  }
  if (type.includes('pdf')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
        <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
      </svg>
    );
  }
  if (type.includes('sheet') || type.includes('excel') || type.includes('spread')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M8 13h2" />
        <path d="M8 17h2" />
        <path d="M14 13h2" />
        <path d="M14 17h2" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
};

const getFileTypeCategory = (type: string): FilterOption => {
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('sheet') || type.includes('excel') || type.includes('spread')) return 'excel';
  if (type.includes('word') || type.includes('doc')) return 'word';
  return 'all';
};

export default function DocumentsPage() {
  const router = useRouter();
  const hg = isHomegateTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [selectedShareTargets, setSelectedShareTargets] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);

  const [newContact, setNewContact] = useState({
    name: '',
    role: 'Notary',
    email: '',
    phone: '',
  });

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sharePickerFor, setSharePickerFor] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.displayName.toLowerCase().includes(query) ||
          doc.originalName.toLowerCase().includes(query) ||
          doc.propertyTag?.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((doc) => getFileTypeCategory(doc.type) === filterType);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'version':
          return b.version - a.version;
        case 'date':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    return sorted;
  }, [documents, searchQuery, filterType, sortBy]);

  const filteredContacts = useMemo(() => {
    if (!contactSearchQuery.trim()) return contacts;
    const query = contactSearchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query)
    );
  }, [contacts, contactSearchQuery]);

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.email.trim()) return;

    const newEntry: Contact = {
      id: uuidv4(),
      name: newContact.name.trim(),
      role: newContact.role,
      email: newContact.email.trim(),
      phone: newContact.phone.trim(),
      color: CONTACT_COLORS[contacts.length % CONTACT_COLORS.length],
    };

    setContacts((prev) => [...prev, newEntry]);
    setNewContact({ name: '', role: 'Notary', email: '', phone: '' });
  };

  const getNextVersion = (originalName: string) => {
    const versions = documents
      .filter((doc) => doc.originalName === originalName)
      .map((doc) => doc.version);
    return versions.length ? Math.max(...versions) + 1 : 1;
  };

  const handleFiles = (files: FileList) => {
    const incoming: DocumentItem[] = Array.from(files).map((file) => {
      const version = getNextVersion(file.name);
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      return {
        id: uuidv4(),
        originalName: file.name,
        displayName: file.name.replace(/\.[^.]+$/, ''),
        version,
        size: formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        type: file.type,
        previewUrl,
        sharedWith: [],
      };
    });

    setDocuments((prev) => [...incoming, ...prev]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const toggleSelection = (docId: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const toggleShareTarget = (contactId: string) => {
    setSelectedShareTargets((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  const shareSelectedDocs = () => {
    if (selectedDocs.size === 0 || selectedShareTargets.size === 0) return;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (!selectedDocs.has(doc.id)) return doc;
        const combined = new Set([...doc.sharedWith, ...selectedShareTargets]);
        return { ...doc, sharedWith: Array.from(combined) };
      })
    );
  };

  const shareSingleDoc = (docId: string, contactId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId && contactId ? { ...doc, sharedWith: Array.from(new Set([...doc.sharedWith, contactId])) } : doc
      )
    );
    setSharePickerFor(null);
  };

  const revokeAccess = (docId: string, contactId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, sharedWith: doc.sharedWith.filter((c) => c !== contactId) } : doc
      )
    );
  };

  const startRename = (doc: DocumentItem) => {
    setEditingDocId(doc.id);
    setEditingName(doc.displayName);
  };

  const saveRename = (docId: string) => {
    if (!editingName.trim()) return;
    setDocuments((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, displayName: editingName.trim() } : doc)));
    setEditingDocId(null);
    setEditingName('');
  };

  const updatePropertyTag = (docId: string, tag: string) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, propertyTag: tag } : doc)));
  };

  const handleDeleteClick = (docId: string) => {
    setDocToDelete(docId);
    setBulkDeleteMode(false);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedDocs.size === 0) return;
    setDocToDelete(null);
    setBulkDeleteMode(true);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bulkDeleteMode && selectedDocs.size > 0) {
      setDocuments((prev) => prev.filter((doc) => !selectedDocs.has(doc.id)));
      setSelectedDocs(new Set());
    } else if (docToDelete) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== docToDelete));
      setSelectedDocs((prev) => {
        const next = new Set(prev);
        next.delete(docToDelete);
        return next;
      });
    }
    setDeleteDialogOpen(false);
    setDocToDelete(null);
    setBulkDeleteMode(false);
  };

  const deleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        sharedWith: doc.sharedWith.filter((id) => id !== contactId),
      }))
    );
  };

  const accent = hg ? '#e5007d' : '#0ea5e9';

  return (
    <div className={`min-h-screen ${hg ? 'bg-gray-50' : 'bg-slate-950'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-40 ${
        hg ? 'border-gray-200 bg-white' : 'border-slate-800 bg-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className={hg ? 'text-gray-500 hover:text-gray-900' : 'text-slate-400 hover:text-white'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${hg ? 'bg-[#e5007d]' : 'bg-sky-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-lg font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
                  Document Manager
                </h1>
                <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  Personal Workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className={`text-2xl font-bold ${hg ? 'text-gray-900' : 'text-white'}`}>{documents.length}</p>
                <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>Documents</p>
              </div>
              <div className={`w-px h-8 ${hg ? 'bg-gray-200' : 'bg-slate-700'}`} />
              <div className="text-center">
                <p className={`text-2xl font-bold ${hg ? 'text-gray-900' : 'text-white'}`}>{contacts.length}</p>
                <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>Contacts</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <div
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                hg
                  ? dragActive
                    ? 'border-[#e5007d] bg-pink-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  : dragActive
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                hg ? 'bg-pink-100' : 'bg-slate-800'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-6 w-6 ${hg ? 'text-[#e5007d]' : 'text-sky-400'}`}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className={`font-medium mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                Drop files here or click to upload
              </p>
              <p className={`text-sm mb-4 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                Supports PDF, Excel, Word, and images
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className={hg ? 'bg-[#e5007d] hover:bg-[#c00069] text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 ${hg ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterOption)}>
                <SelectTrigger className={`w-full sm:w-32 ${hg ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={hg ? 'bg-white' : 'bg-slate-900'}>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className={`w-full sm:w-36 ${hg ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={hg ? 'bg-white' : 'bg-slate-900'}>
                  <SelectItem value="date">Newest first</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="version">Version</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedDocs.size > 0 && (
              <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                hg ? 'bg-pink-50 border border-pink-200' : 'bg-sky-500/10 border border-sky-500/20'
              }`}>
                <span className={`text-sm font-medium ${hg ? 'text-[#e5007d]' : 'text-sky-400'}`}>
                  {selectedDocs.size} document{selectedDocs.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={hg ? 'border-pink-300' : 'border-sky-500/50'}>
                        Share with...
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={hg ? 'bg-white' : 'bg-slate-900'}>
                      <DropdownMenuLabel>Share with</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {contacts.map((contact) => (
                        <DropdownMenuCheckboxItem
                          key={contact.id}
                          checked={selectedShareTargets.has(contact.id)}
                          onCheckedChange={() => toggleShareTarget(contact.id)}
                        >
                          {contact.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {selectedShareTargets.size > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <Button size="sm" className="w-full mt-1" onClick={shareSelectedDocs}>
                            Share
                          </Button>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Document List */}
            <div className="space-y-3">
              {filteredAndSortedDocuments.length === 0 ? (
                <div className={`rounded-xl border p-12 text-center ${hg ? 'bg-white border-gray-200' : 'bg-slate-900/50 border-slate-800'}`}>
                  <FileIcon type="" className={`h-12 w-12 mx-auto mb-4 ${hg ? 'text-gray-300' : 'text-slate-600'}`} />
                  <p className={`font-medium mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    {searchQuery || filterType !== 'all' ? 'No documents found' : 'No documents yet'}
                  </p>
                  <p className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                    {searchQuery || filterType !== 'all' ? 'Try a different search.' : 'Upload your first document above.'}
                  </p>
                </div>
              ) : (
                filteredAndSortedDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`overflow-hidden transition-shadow hover:shadow-md ${
                      hg ? 'bg-white border-gray-200' : 'bg-slate-900/50 border-slate-800'
                    } ${selectedDocs.has(doc.id) ? (hg ? 'ring-2 ring-[#e5007d]' : 'ring-2 ring-sky-500') : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          className={`mt-1 h-4 w-4 rounded cursor-pointer accent-[${accent}]`}
                          checked={selectedDocs.has(doc.id)}
                          onChange={() => toggleSelection(doc.id)}
                        />
                        
                        {/* File Icon */}
                        <div className={`relative flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${
                          hg ? 'bg-gray-100' : 'bg-slate-800'
                        }`}>
                          {doc.previewUrl ? (
                            <Image src={doc.previewUrl} alt="" fill unoptimized className="object-cover" />
                          ) : (
                            <FileIcon type={doc.type} className={`h-6 w-6 ${hg ? 'text-gray-500' : 'text-slate-400'}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {editingDocId === doc.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveRename(doc.id);
                                      if (e.key === 'Escape') { setEditingDocId(null); setEditingName(''); }
                                    }}
                                    className="h-8"
                                    autoFocus
                                  />
                                  <Button size="sm" variant="ghost" onClick={() => saveRename(doc.id)}>Save</Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startRename(doc)}
                                  className={`font-medium text-left truncate hover:underline ${hg ? 'text-gray-900' : 'text-white'}`}
                                >
                                  {doc.displayName}
                                </button>
                              )}
                              <p className={`text-sm truncate ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                                {doc.originalName} · {doc.size} · {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {doc.propertyTag && (
                                <Badge className={hg ? 'bg-pink-100 text-[#e5007d] hover:bg-pink-100' : 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/20'}>
                                  {doc.propertyTag}
                                </Badge>
                              )}
                              <Badge variant="outline" className={hg ? 'border-gray-200' : 'border-slate-700'}>
                                v{doc.version}
                              </Badge>
                            </div>
                          </div>

                          {/* Actions Row */}
                          <div className="flex items-center gap-2 mt-3">
                            <Input
                              placeholder="Link to property..."
                              value={doc.propertyTag || ''}
                              onChange={(e) => updatePropertyTag(doc.id, e.target.value)}
                              className={`h-8 text-sm max-w-[200px] ${hg ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'}`}
                            />
                            <DropdownMenu open={sharePickerFor === doc.id} onOpenChange={(open) => setSharePickerFor(open ? doc.id : null)}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">Share</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className={hg ? 'bg-white' : 'bg-slate-900'}>
                                <DropdownMenuLabel>Share with</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {contacts.map((contact) => (
                                  <DropdownMenuItemWithCheck
                                    key={contact.id}
                                    checked={doc.sharedWith.includes(contact.id)}
                                    label={contact.name}
                                    onSelect={() => shareSingleDoc(doc.id, contact.id)}
                                    homegate={hg}
                                  />
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteClick(doc.id)}
                            >
                              Delete
                            </Button>
                          </div>

                          {/* Shared With */}
                          {doc.sharedWith.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                              <span className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-500'}`}>Shared:</span>
                              <div className="flex -space-x-2">
                                {doc.sharedWith.slice(0, 4).map((contactId) => {
                                  const contact = contacts.find((c) => c.id === contactId);
                                  if (!contact) return null;
                                  return (
                                    <Avatar key={contact.id} className="h-6 w-6 border-2 border-white">
                                      <AvatarFallback style={{ backgroundColor: contact.color }} className="text-[10px] text-white">
                                        {contact.name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  );
                                })}
                                {doc.sharedWith.length > 4 && (
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] border-2 border-white ${hg ? 'bg-gray-200 text-gray-600' : 'bg-slate-700 text-slate-300'}`}>
                                    +{doc.sharedWith.length - 4}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs ml-auto"
                                onClick={() => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, sharedWith: [] } : d)))}
                              >
                                Revoke all
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Contacts */}
          <div className="space-y-6">
            <div className={`rounded-2xl border overflow-hidden ${hg ? 'bg-white border-gray-200' : 'bg-slate-900/50 border-slate-800'}`}>
              {/* Contacts Header */}
              <div className={`px-5 py-4 border-b ${hg ? 'border-gray-100' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>Trusted Contacts</h2>
                    <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>Share documents securely</p>
                  </div>
                  <Badge className={hg ? 'bg-[#e5007d]' : 'bg-sky-500'}>{contacts.length}</Badge>
                </div>
              </div>

              {/* Add Contact Form */}
              <div className={`p-5 border-b ${hg ? 'border-gray-100 bg-gray-50/50' : 'border-slate-800 bg-slate-900/30'}`}>
                <div className="space-y-3">
                  <Input
                    value={newContact.name}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact name"
                    className={`h-9 ${hg ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newContact.role} onValueChange={(value) => setNewContact((prev) => ({ ...prev, role: value }))}>
                      <SelectTrigger className={`h-9 ${hg ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}`}>
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent className={hg ? 'bg-white' : 'bg-slate-900'}>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={newContact.phone}
                      onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone"
                      className={`h-9 ${hg ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}`}
                    />
                  </div>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                    className={`h-9 ${hg ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}`}
                  />
                  <Button
                    className={`w-full h-9 ${hg ? 'bg-[#e5007d] hover:bg-[#c00069]' : 'bg-sky-500 hover:bg-sky-600'}`}
                    onClick={handleAddContact}
                    disabled={!newContact.name || !newContact.email}
                  >
                    Add Contact
                  </Button>
                </div>
              </div>

              {/* Search Contacts */}
              <div className="p-4">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-500'}`}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <Input
                    placeholder="Search contacts..."
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    className={`pl-9 h-9 ${hg ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'}`}
                  />
                </div>
              </div>

              {/* Contact List */}
              <div className="px-4 pb-4 space-y-2 max-h-[400px] overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <p className={`text-center py-8 text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                    {contactSearchQuery ? 'No contacts found' : 'Add your first contact'}
                  </p>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${hg ? 'bg-gray-50 hover:bg-gray-100' : 'bg-slate-800/50 hover:bg-slate-800'}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback style={{ backgroundColor: contact.color }} className="text-white font-medium">
                          {contact.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${hg ? 'text-gray-900' : 'text-white'}`}>{contact.name}</p>
                        <p className={`text-xs truncate ${hg ? 'text-gray-500' : 'text-slate-400'}`}>{contact.role}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${hg ? 'border-gray-200' : 'border-slate-700'}`}>
                        {documents.filter((d) => d.sharedWith.includes(contact.id)).length} docs
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteContact(contact.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={hg ? 'bg-white' : 'bg-slate-900'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={hg ? 'text-gray-900' : 'text-white'}>
              {bulkDeleteMode ? `Delete ${selectedDocs.size} document${selectedDocs.size > 1 ? 's' : ''}?` : 'Delete document?'}
            </AlertDialogTitle>
            <AlertDialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DropdownMenuItemWithCheck({ label, checked, onSelect, homegate }: { label: string; checked: boolean; onSelect: () => void; homegate: boolean; }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md transition-colors ${
        homegate ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-slate-800/40 text-slate-200'
      }`}
      onClick={onSelect}
    >
      <span className={`h-4 w-4 inline-flex items-center justify-center rounded border ${
        checked
          ? homegate ? 'bg-[#e5007d] text-white border-[#e5007d]' : 'bg-sky-500 text-white border-sky-500'
          : homegate ? 'border-gray-300' : 'border-slate-500'
      }`}>
        {checked ? '✓' : ''}
      </span>
      <span>{label}</span>
    </button>
  );
}
