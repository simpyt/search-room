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

const fileIcon = (type: string) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('sheet') || type.includes('excel') || type.includes('spread')) return '📊';
  if (type.includes('word') || type.includes('doc')) return '📝';
  return '📁';
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

  const selectedDocuments = useMemo(
    () => documents.filter((doc) => selectedDocs.has(doc.id)),
    [documents, selectedDocs]
  );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden border-0 shadow-2xl ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full overflow-hidden">
          {/* Documents */}
          <div className="lg:col-span-2 h-full flex flex-col gap-4 overflow-hidden">
            <div
              className={`rounded-2xl border ${
                hg
                  ? dragActive
                    ? 'border-[#e5007d] bg-[#fff1f8]'
                    : 'bg-white border-gray-200'
                  : dragActive
                  ? 'border-sky-500 bg-slate-800/60'
                  : 'bg-slate-900/50 border-slate-800'
              } shadow-sm transition-colors duration-200`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${
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
                      className="h-6 w-6 text-white"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
                      Drag & drop or browse files
                    </p>
                    <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
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

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className={
                      hg
                        ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
                    }
                  >
                    Browse files
                  </Button>
                  <Separator orientation="vertical" className="hidden md:block h-8" />
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full ${hg ? 'bg-[#e5007d]' : 'bg-sky-400'}`} />
                    <span className={hg ? 'text-gray-700' : 'text-slate-300'}>Drop anywhere in this panel</span>
                  </div>
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
              <div className="grid gap-3 md:grid-cols-2">
                {documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`relative overflow-hidden border ${
                      hg ? 'bg-white border-gray-200' : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {doc.propertyTag && (
                        <Badge className={hg ? 'bg-[#e5007d] text-white' : 'bg-sky-500 text-white'}>
                          #{doc.propertyTag}
                        </Badge>
                      )}
                      <Badge variant="outline" className={hg ? 'border-gray-200' : 'border-slate-700 text-slate-200'}>
                        v{doc.version}
                      </Badge>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={selectedDocs.has(doc.id)}
                          onChange={() => toggleSelection(doc.id)}
                        />
                        <div className="flex-1 min-w-0">
                          {editingDocId === doc.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
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
                              <CardTitle className={`truncate ${hg ? 'text-gray-900' : 'text-white'}`}>
                                {doc.displayName}
                              </CardTitle>
                              <Button variant="ghost" size="icon" onClick={() => startRename(doc)}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={`h-4 w-4 ${hg ? 'text-gray-500' : 'text-slate-400'}`}
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </Button>
                            </div>
                          )}
                          <CardDescription className={hg ? 'text-gray-500' : 'text-slate-400'}>
                            {doc.originalName} • {doc.size}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-16 w-16 rounded-xl flex items-center justify-center text-2xl ${
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

                      <div className="space-y-2">
                        <p className={`text-xs font-semibold ${hg ? 'text-gray-700' : 'text-slate-200'}`}>Shared with</p>
                        <div className="flex flex-wrap gap-2">
                          {doc.sharedWith.length === 0 && (
                            <span className={hg ? 'text-gray-500 text-xs' : 'text-slate-500 text-xs'}>
                              Not shared yet
                            </span>
                          )}
                          {doc.sharedWith.map((contactId) => {
                            const contact = contacts.find((c) => c.id === contactId);
                            if (!contact) return null;
                            return (
                              <div
                                key={contact.id}
                                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                                  hg ? 'bg-gray-100 text-gray-700' : 'bg-slate-800 text-slate-200'
                                }`}
                              >
                                <div
                                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white"
                                  style={{ backgroundColor: contact.color }}
                                >
                                  {contact.name[0]}
                                </div>
                                <span>{contact.name}</span>
                                <button
                                  onClick={() => revokeAccess(doc.id, contact.id)}
                                  className={hg ? 'text-gray-400 hover:text-gray-600' : 'text-slate-500 hover:text-slate-300'}
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Contacts */}
          <div className={`h-full rounded-2xl border flex flex-col ${hg ? 'bg-white border-gray-200' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="p-4 border-b border-gray-200/60 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>
                  Decision partners
                </p>
                <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                  Save everyone you need: notary, banker, consultant, expert...
                </p>
              </div>
              <Badge className={hg ? 'bg-[#e5007d] text-white' : 'bg-sky-500 text-white'}>{contacts.length}</Badge>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <Label className={hg ? 'text-gray-700' : 'text-slate-200'}>Name</Label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Add a trusted contact"
                  className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className={hg ? 'text-gray-700' : 'text-slate-200'}>Role</Label>
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
                  <Label className={hg ? 'text-gray-700' : 'text-slate-200'}>Phone</Label>
                  <Input
                    value={newContact.phone}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+41 79 ..."
                    className={hg ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className={hg ? 'text-gray-700' : 'text-slate-200'}>Email</Label>
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
                    ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white w-full'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white w-full'
                }
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.email}
              >
                Add contact
              </Button>
            </div>

            <Separator className={hg ? 'bg-gray-200' : 'bg-slate-800'} />

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={`border ${hg ? 'bg-gray-50 border-gray-200' : 'bg-slate-900 border-slate-800'}`}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className="text-white"
                          style={{ backgroundColor: contact.color }}
                        >
                          {contact.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${hg ? 'text-gray-900' : 'text-white'}`}>{contact.name}</p>
                          <Badge className={hg ? 'bg-white border border-gray-200 text-gray-700' : 'bg-slate-800 border-slate-700 text-slate-200'}>
                            {contact.role}
                          </Badge>
                        </div>
                        <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-400'}`}>{contact.email}</p>
                        {contact.phone && (
                          <p className={`text-xs ${hg ? 'text-gray-500' : 'text-slate-500'}`}>{contact.phone}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-right">
                        <span className={hg ? 'text-gray-500' : 'text-slate-500'}>Linked docs:</span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {documents
                            .filter((doc) => doc.sharedWith.includes(contact.id))
                            .slice(0, 3)
                            .map((doc) => (
                              <Badge key={doc.id} variant="outline" className={hg ? 'border-gray-200' : 'border-slate-700 text-slate-200'}>
                                v{doc.version}
                              </Badge>
                            ))}
                          {documents.filter((doc) => doc.sharedWith.includes(contact.id)).length === 0 && (
                            <span className={hg ? 'text-gray-500' : 'text-slate-500'}>None yet</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
