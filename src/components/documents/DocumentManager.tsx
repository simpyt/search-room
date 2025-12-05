import type { DragEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface DocumentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const fileIcon = (type: string) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('sheet') || type.includes('excel') || type.includes('spread')) return '📊';
  if (type.includes('word') || type.includes('doc')) return '📝';
  return '📁';
};

const getFileTypeCategory = (type: string): FilterOption => {
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('sheet') || type.includes('excel') || type.includes('spread')) return 'excel';
  if (type.includes('word') || type.includes('doc')) return 'word';
  return 'all';
};

export function DocumentManager({ open, onOpenChange }: DocumentManagerProps) {
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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  
  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.displayName.toLowerCase().includes(query) ||
          doc.originalName.toLowerCase().includes(query) ||
          doc.propertyTag?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((doc) => getFileTypeCategory(doc.type) === filterType);
    }

    // Apply sorting
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

  // Filter contacts
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
    // Remove from shared documents
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        sharedWith: doc.sharedWith.filter((id) => id !== contactId),
      }))
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`max-w-[1600px] w-[95vw] max-h-[90vh] overflow-hidden border-0 shadow-2xl ${
            hg ? 'bg-white' : 'bg-slate-900'
          }`}
        >
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${
                  hg
                    ? 'bg-gradient-to-br from-[#e5007d] to-[#ff6fb7]'
                    : 'bg-gradient-to-br from-sky-500 to-indigo-600'
                }`}
              >
                <span className="text-white text-xl">📁</span>
              </div>
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  Personal workspace
                </p>
                <DialogTitle className={`text-2xl font-bold ${hg ? 'text-gray-900' : 'text-white'}`}>
                  Document Manager
                </DialogTitle>
                <DialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
                  Upload, preview and share every document required for your next move.
                </DialogDescription>
              </div>
            </div>
            <div className="hidden sm:flex gap-3">
              <Card className={`px-3 py-2 ${hg ? 'bg-white border-gray-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <CardDescription className="text-xs">Documents</CardDescription>
                <CardTitle className={`text-lg ${hg ? 'text-gray-900' : 'text-white'}`}>{documents.length}</CardTitle>
              </Card>
              <Card className={`px-3 py-2 ${hg ? 'bg-white border-gray-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <CardDescription className="text-xs">Trusted contacts</CardDescription>
                <CardTitle className={`text-lg ${hg ? 'text-gray-900' : 'text-white'}`}>{contacts.length}</CardTitle>
              </Card>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 h-full overflow-hidden">
          {/* Documents */}
          <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div
              className={`rounded-2xl border-2 border-dashed transition-all duration-300 ${
                hg
                  ? dragActive
                    ? 'border-[#e5007d] bg-[#fff1f8] shadow-lg scale-[1.01]'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                  : dragActive
                  ? 'border-sky-500 bg-slate-800/60 shadow-lg scale-[1.01]'
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
              } shadow-sm`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                      dragActive ? 'scale-110' : ''
                    } ${
                      hg
                        ? 'bg-gradient-to-br from-[#e5007d] to-[#ff8ac6]'
                        : 'bg-gradient-to-br from-sky-500 to-indigo-600'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7 text-white"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-base font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
                      Drag & drop or browse files
                    </p>
                    <p className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                      Automatic versioning keeps the history when a filename already exists.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className={
                      hg
                        ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white shadow-md hover:shadow-lg transition-shadow'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-shadow'
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Browse files
                  </Button>
                  <Separator orientation="vertical" className="hidden md:block h-8" />
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${hg ? 'bg-[#e5007d]' : 'bg-sky-400'}`} />
                    <span className={hg ? 'text-gray-700' : 'text-slate-300'}>Drop anywhere in this panel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className={`rounded-xl border px-4 py-3 ${hg ? 'bg-white border-gray-200' : 'bg-slate-900/50 border-slate-800'}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-9 ${hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterOption)}>
                    <SelectTrigger className={`w-[140px] ${hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>
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
                    <SelectTrigger className={`w-[140px] ${hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={hg ? 'bg-white' : 'bg-slate-900'}>
                      <SelectItem value="date">Date (newest)</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="version">Version</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedDocs.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDeleteClick}
                      className={hg ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-red-500/50 text-red-400 hover:bg-red-500/10'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 mr-1"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      Delete ({selectedDocs.size})
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className={`rounded-xl border px-4 py-3 ${hg ? 'bg-white border-gray-200' : 'bg-slate-900/50 border-slate-800'}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className={`text-sm font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
                    Share a curated bundle
                  </p>
                  <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                    Select a few documents and hand-pick who gets access.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className={hg ? 'border-gray-300' : 'border-slate-700 text-slate-200'}>
                        {selectedShareTargets.size > 0
                          ? `${selectedShareTargets.size} contact${selectedShareTargets.size > 1 ? 's' : ''} selected`
                          : 'Choose contacts'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={hg ? 'bg-white' : 'bg-slate-900'}>
                      <DropdownMenuLabel className={hg ? 'text-gray-900' : 'text-white'}>
                        Share with
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {contacts.map((contact) => (
                        <DropdownMenuCheckboxItem
                          key={contact.id}
                          checked={selectedShareTargets.has(contact.id)}
                          onCheckedChange={() => toggleShareTarget(contact.id)}
                        >
                          <span className="mr-2 text-lg" aria-hidden>
                            {fileIcon(contact.role)}
                          </span>
                          {contact.name} ({contact.role})
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    className={hg ? 'border-gray-300' : 'border-slate-700 text-slate-200'}
                    disabled={selectedDocs.size === 0 || selectedShareTargets.size === 0}
                    onClick={shareSelectedDocs}
                  >
                    Share with selected
                  </Button>
                  <span className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-500'}`}>
                    {selectedDocs.size} selected
                  </span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 pr-2">
              {filteredAndSortedDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 ${
                    hg ? 'bg-gray-100' : 'bg-slate-800'
                  }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-10 w-10 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <p className={`text-lg font-semibold mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    {searchQuery || filterType !== 'all' ? 'No documents found' : 'No documents yet'}
                  </p>
                  <p className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'} text-center max-w-md`}>
                    {searchQuery || filterType !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Upload your first document by dragging and dropping files or clicking the browse button above.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`relative overflow-hidden border transition-all duration-200 hover:shadow-lg ${
                        hg
                          ? 'bg-white border-gray-200 hover:border-gray-300'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        {doc.propertyTag && (
                          <Badge className={hg ? 'bg-[#e5007d] text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'}>
                            #{doc.propertyTag}
                          </Badge>
                        )}
                        <Badge variant="outline" className={hg ? 'border-gray-200 bg-white' : 'border-slate-700 text-slate-200 bg-slate-800'}>
                          v{doc.version}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(doc.id)}
                          className={`h-8 w-8 ${hg ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-red-500/10 hover:text-red-400'}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </Button>
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-4 pr-20">
                          <input
                            type="checkbox"
                            className="mt-1.5 h-5 w-5 cursor-pointer rounded border-gray-300"
                            checked={selectedDocs.has(doc.id)}
                            onChange={() => toggleSelection(doc.id)}
                          />
                          <div className="flex-1 min-w-0">
                            {editingDocId === doc.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveRename(doc.id);
                                    if (e.key === 'Escape') {
                                      setEditingDocId(null);
                                      setEditingName('');
                                    }
                                  }}
                                  className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
                                  autoFocus
                                />
                                <Button size="sm" onClick={() => saveRename(doc.id)}>
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingDocId(null);
                                    setEditingName('');
                                  }}
                                  className={hg ? 'text-gray-500' : 'text-slate-400'}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CardTitle className={`text-lg truncate ${hg ? 'text-gray-900' : 'text-white'}`}>
                                  {doc.displayName}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => startRename(doc)} className="h-7 w-7">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`h-4 w-4 ${hg ? 'text-gray-500 hover:text-gray-700' : 'text-slate-400 hover:text-slate-200'}`}
                                  >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                </Button>
                              </div>
                            )}
                            <CardDescription className={`mt-1 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                              {doc.originalName} • {doc.size}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`h-20 w-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 transition-transform duration-200 hover:scale-105 ${
                              hg ? 'bg-gray-100' : 'bg-slate-800'
                            }`}
                          >
                            {doc.previewUrl ? (
                              <img
                                src={doc.previewUrl}
                                alt={doc.displayName}
                                className="h-full w-full object-cover rounded-xl"
                              />
                            ) : (
                              <span>{fileIcon(doc.type)}</span>
                            )}
                          </div>
                        <div className="flex-1 space-y-1">
                          <div className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                            Uploaded {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Tag with a property"
                              value={doc.propertyTag || ''}
                              onChange={(e) => updatePropertyTag(doc.id, e.target.value)}
                              className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
                            />
                            <Badge variant="outline" className={hg ? 'border-gray-200' : 'border-slate-700 text-slate-200'}>
                              Link a doc to a home
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <DropdownMenu open={sharePickerFor === doc.id} onOpenChange={(open) => setSharePickerFor(open ? doc.id : null)}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className={hg ? 'border-gray-300' : 'border-slate-700 text-slate-200'}>
                                  Share...
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className={hg ? 'bg-white' : 'bg-slate-900'}>
                                <DropdownMenuLabel className={hg ? 'text-gray-900' : 'text-white'}>
                                  Share “{doc.displayName}”
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {contacts.map((contact) => (
                                  <DropdownMenuItemWithCheck
                                    key={contact.id}
                                    checked={doc.sharedWith.includes(contact.id)}
                                    label={`${contact.name} • ${contact.role}`}
                                    onSelect={() => shareSingleDoc(doc.id, contact.id)}
                                    homegate={hg}
                                  />
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="outline"
                              size="sm"
                              className={hg ? 'border-red-200 text-red-600' : 'border-red-500/50 text-red-400'}
                              onClick={() => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, sharedWith: [] } : d)))}
                            >
                              Remove access
                            </Button>
                          </div>
                        </div>
                      </div>

                        {doc.sharedWith.length > 0 && (
                          <div className="space-y-2 pt-2 border-t">
                            <p className={`text-xs font-semibold ${hg ? 'text-gray-700' : 'text-slate-200'}`}>Shared with</p>
                            <div className="flex flex-wrap gap-2">
                              {doc.sharedWith.map((contactId) => {
                                const contact = contacts.find((c) => c.id === contactId);
                                if (!contact) return null;
                                return (
                                  <div
                                    key={contact.id}
                                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${
                                      hg ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                    }`}
                                  >
                                    <div
                                      className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shadow-sm"
                                      style={{ backgroundColor: contact.color }}
                                    >
                                      {contact.name[0]}
                                    </div>
                                    <span>{contact.name}</span>
                                    <button
                                      onClick={() => revokeAccess(doc.id, contact.id)}
                                      className={`ml-1 hover:scale-110 transition-transform ${hg ? 'text-gray-400 hover:text-gray-600' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Contacts */}
          <div className={`h-full rounded-2xl border flex flex-col ${hg ? 'bg-white border-gray-200' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <p className={`text-base font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
                  Decision partners
                </p>
                <p className={`text-xs mt-1 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  Save everyone you need: notary, banker, consultant, expert...
                </p>
              </div>
              <Badge className={hg ? 'bg-[#e5007d] text-white shadow-sm' : 'bg-sky-500 text-white shadow-sm'}>{contacts.length}</Badge>
            </div>

            {/* Contact Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <Input
                  placeholder="Search contacts..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className={`pl-9 ${hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}`}
                />
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Label className={hg ? 'text-gray-700 font-medium' : 'text-slate-200 font-medium'}>Name</Label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Add a trusted contact"
                  className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className={hg ? 'text-gray-700 font-medium' : 'text-slate-200 font-medium'}>Role</Label>
                  <Select
                    value={newContact.role}
                    onValueChange={(value) => setNewContact((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700 text-slate-200'}>
                      <SelectValue placeholder="Choose role" />
                    </SelectTrigger>
                    <SelectContent className={hg ? 'bg-white' : 'bg-slate-900'}>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={hg ? 'text-gray-700 font-medium' : 'text-slate-200 font-medium'}>Phone</Label>
                  <Input
                    value={newContact.phone}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+41 79 ..."
                    className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={hg ? 'text-gray-700 font-medium' : 'text-slate-200 font-medium'}>Email</Label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@example.com"
                  className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
                />
              </div>
              <Button
                className={
                  hg
                    ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white w-full shadow-md hover:shadow-lg transition-shadow'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white w-full shadow-md hover:shadow-lg transition-shadow'
                }
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.email}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Add contact
              </Button>
            </div>

            <Separator className={hg ? 'bg-gray-200' : 'bg-slate-800'} />

            <ScrollArea className="flex-1 p-4">
              {filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${
                    hg ? 'bg-gray-100' : 'bg-slate-800'
                  }`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-8 w-8 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className={`text-sm font-medium mb-1 ${hg ? 'text-gray-900' : 'text-white'}`}>
                    {contactSearchQuery ? 'No contacts found' : 'No contacts yet'}
                  </p>
                  <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'} text-center`}>
                    {contactSearchQuery ? 'Try a different search term.' : 'Add your first contact above.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContacts.map((contact) => (
                    <Card
                      key={contact.id}
                      className={`border transition-all duration-200 hover:shadow-md ${
                        hg ? 'bg-gray-50 border-gray-200 hover:border-gray-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarFallback
                              className="text-white font-semibold shadow-sm"
                              style={{ backgroundColor: contact.color }}
                            >
                              {contact.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>{contact.name}</p>
                              <Badge className={`text-xs ${hg ? 'bg-white border border-gray-200 text-gray-700' : 'bg-slate-800 border-slate-700 text-slate-200'}`}>
                                {contact.role}
                              </Badge>
                            </div>
                            <p className={`text-xs mb-1 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>{contact.email}</p>
                            {contact.phone && (
                              <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-500'}`}>{contact.phone}</p>
                            )}
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-500'}`}>Linked docs:</span>
                                <div className="flex gap-1 flex-wrap justify-end">
                                  {documents
                                    .filter((doc) => doc.sharedWith.includes(contact.id))
                                    .slice(0, 3)
                                    .map((doc) => (
                                      <Badge key={doc.id} variant="outline" className={`text-xs ${hg ? 'border-gray-200' : 'border-slate-700 text-slate-200'}`}>
                                        v{doc.version}
                                      </Badge>
                                    ))}
                                  {documents.filter((doc) => doc.sharedWith.includes(contact.id)).length === 0 && (
                                    <span className={`text-xs ${hg ? 'text-gray-400' : 'text-slate-500'}`}>None</span>
                                  )}
                                  {documents.filter((doc) => doc.sharedWith.includes(contact.id)).length > 3 && (
                                    <Badge variant="outline" className={`text-xs ${hg ? 'border-gray-200' : 'border-slate-700 text-slate-200'}`}>
                                      +{documents.filter((doc) => doc.sharedWith.includes(contact.id)).length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteContact(contact.id)}
                            className={`h-8 w-8 flex-shrink-0 ${hg ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-red-500/10 hover:text-red-400'}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={hg ? 'bg-white' : 'bg-slate-900'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={hg ? 'text-gray-900' : 'text-white'}>
              {bulkDeleteMode ? `Delete ${selectedDocs.size} document${selectedDocs.size > 1 ? 's' : ''}?` : 'Delete document?'}
            </AlertDialogTitle>
            <AlertDialogDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
              {bulkDeleteMode
                ? `Are you sure you want to delete ${selectedDocs.size} selected document${selectedDocs.size > 1 ? 's' : ''}? This action cannot be undone.`
                : 'Are you sure you want to delete this document? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={hg ? 'border-gray-300' : 'border-slate-700'}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={
                hg
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DropdownMenuItemWithCheck({
  label,
  checked,
  onSelect,
  homegate,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  homegate: boolean;
}) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md transition-colors ${
        homegate ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-slate-800/40 text-slate-200'
      }`}
      onClick={onSelect}
    >
      <span
        className={`h-4 w-4 inline-flex items-center justify-center rounded border ${
          checked
            ? homegate
              ? 'bg-[#e5007d] text-white border-[#e5007d]'
              : 'bg-sky-500 text-white'
            : homegate
            ? 'border-gray-300'
            : 'border-slate-500'
        }`}
      >
        {checked ? '✓' : ''}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default DocumentManager;
