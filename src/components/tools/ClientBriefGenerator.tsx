import React, { useState, useRef } from 'react';
import { Users, Upload, Save, FileText, X, Plus, Send, ExternalLink, Eye, Download, FolderOpen, Link as LinkIcon, Copy, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

interface BriefFormData {
  businessName: string;
  description: string;
  productDetails: string;
  targetAudience: string;
  objectives: string;
  timeline: string;
  budget: string;
  additionalNotes: string;
  files: File[];
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export function ClientBriefGenerator() {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState<BriefFormData>({
    businessName: '',
    description: '',
    productDetails: '',
    targetAudience: '',
    objectives: '',
    timeline: '',
    budget: '',
    additionalNotes: '',
    files: [],
  });
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
  });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-populate form when client is selected
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    
    if (clientId) {
      const client = state.clients.find(c => c.id === clientId);
      if (client) {
        setFormData(prev => ({
          ...prev,
          businessName: client.name,
          description: prev.description || `${client.businessType} business focused on delivering exceptional value to customers.`,
        }));
      }
    } else {
      // Reset form when no client selected
      setFormData({
        businessName: '',
        description: '',
        productDetails: '',
        targetAudience: '',
        objectives: '',
        timeline: '',
        budget: '',
        additionalNotes: '',
        files: [],
      });
      setCustomLinks([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Open file with system default program
  const openFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL after a delay to allow the file to open
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Download file to user's system
  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get file type icon
  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return '🖼️';
    } else if (['pdf'].includes(extension || '')) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return '📊';
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return '📋';
    } else if (['txt'].includes(extension || '')) {
      return '📃';
    } else if (['zip', 'rar', '7z'].includes(extension || '')) {
      return '🗜️';
    } else {
      return '📎';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Custom Links Management
  const addCustomLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      alert('Please enter both title and URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    const link: CustomLink = {
      id: Date.now().toString(),
      title: newLink.title.trim(),
      url: newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`,
      description: newLink.description.trim() || undefined,
    };

    setCustomLinks(prev => [...prev, link]);
    setNewLink({ title: '', url: '', description: '' });
  };

  const updateCustomLink = (id: string, updatedLink: Omit<CustomLink, 'id'>) => {
    if (!updatedLink.title.trim() || !updatedLink.url.trim()) {
      alert('Please enter both title and URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(updatedLink.url.startsWith('http') ? updatedLink.url : `https://${updatedLink.url}`);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setCustomLinks(prev => prev.map(link => 
      link.id === id 
        ? { 
            ...link, 
            ...updatedLink,
            url: updatedLink.url.startsWith('http') ? updatedLink.url : `https://${updatedLink.url}`
          }
        : link
    ));
    setEditingLinkId(null);
  };

  const removeCustomLink = (id: string) => {
    setCustomLinks(prev => prev.filter(link => link.id !== id));
  };

  const copyLinkToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  // Get link type icon based on URL
  const getLinkIcon = (url: string) => {
    const domain = url.toLowerCase();
    if (domain.includes('drive.google.com')) return '📁';
    if (domain.includes('docs.google.com')) return '📝';
    if (domain.includes('sheets.google.com')) return '📊';
    if (domain.includes('forms.google.com')) return '📋';
    if (domain.includes('notion.so') || domain.includes('notion.com')) return '📓';
    if (domain.includes('figma.com')) return '🎨';
    if (domain.includes('canva.com')) return '🖼️';
    if (domain.includes('dropbox.com')) return '📦';
    if (domain.includes('onedrive.com')) return '☁️';
    return '🔗';
  };

  const saveToClient = () => {
    if (!selectedClientId || !formData.businessName) {
      alert('Please select a client and fill in the business name');
      return;
    }

    const client = state.clients.find(c => c.id === selectedClientId);
    
    // Create a comprehensive brief summary for client notes
    const briefSummary = `
CLIENT BRIEF COMPLETED: ${formData.businessName}

BUSINESS DESCRIPTION:
${formData.description}

PRODUCT/SERVICE DETAILS:
${formData.productDetails}

TARGET AUDIENCE:
${formData.targetAudience}

OBJECTIVES:
${formData.objectives}

TIMELINE:
${formData.timeline}

BUDGET:
${formData.budget}

ADDITIONAL NOTES:
${formData.additionalNotes}

REFERENCE LINKS: ${customLinks.length} link(s)
${customLinks.map(link => `- ${link.title}: ${link.url}${link.description ? ` (${link.description})` : ''}`).join('\n')}

FILES ATTACHED: ${formData.files.length} file(s)
${formData.files.map(file => `- ${file.name} (${formatFileSize(file.size)})`).join('\n')}

Brief completed on: ${new Date().toLocaleDateString('en-GB')}
    `.trim();

    // Update client with brief information
    const updatedClient = {
      ...client!,
      notes: client!.notes + (client!.notes ? '\n\n' : '') + briefSummary,
      tags: [...new Set([...client!.tags, 'brief-completed', 'requirements-gathered'])],
    };

    dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
    alert(`Client brief saved to ${client?.name}'s profile!`);
    
    // Reset form
    setFormData({
      businessName: '',
      description: '',
      productDetails: '',
      targetAudience: '',
      objectives: '',
      timeline: '',
      budget: '',
      additionalNotes: '',
      files: [],
    });
    setCustomLinks([]);
    setSelectedClientId('');
  };

  const selectedClient = state.clients.find(c => c.id === selectedClientId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-secondary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Client Brief Generator</h2>
            <p className="text-sm text-gray-600">Create comprehensive client briefs and save to client profiles</p>
          </div>
        </div>
        
        {/* Quick Link to Clients Module */}
        <Link
          to="/clients"
          className="inline-flex items-center px-3 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage Clients
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="client" className="block text-sm font-medium text-secondary-700">
                Select Client for This Brief *
              </label>
              {state.clients.length === 0 && (
                <Link
                  to="/clients/new"
                  className="inline-flex items-center px-2 py-1 text-xs bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Client
                </Link>
              )}
            </div>
            
            {state.clients.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-600 mb-3">No clients found. Add your first client to create briefs.</p>
                <Link
                  to="/clients/new"
                  className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Link>
              </div>
            ) : (
              <>
                <select
                  id="client"
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-white"
                >
                  <option value="">Choose a client</option>
                  {state.clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name} - {client.businessType}</option>
                  ))}
                </select>
                
                {/* Selected Client Info */}
                {selectedClient && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-secondary-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedClient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedClient.name}</p>
                        <p className="text-sm text-gray-600">{selectedClient.businessType}</p>
                        <p className="text-xs text-gray-500">{selectedClient.email}</p>
                      </div>
                      <Link
                        to={`/clients/${selectedClient.id}`}
                        className="ml-auto p-2 text-secondary-600 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Edit Client"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Only show form if client is selected or if no clients exist */}
          {(selectedClientId || state.clients.length === 0) && (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter business name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Timeline
                  </label>
                  <input
                    id="timeline"
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2-3 weeks, ASAP, End of month"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe what the business does, its mission, and key values..."
                  required
                />
              </div>

              {/* Product Details */}
              <div>
                <label htmlFor="productDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Details *
                </label>
                <textarea
                  id="productDetails"
                  value={formData.productDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, productDetails: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Detailed information about products or services to be promoted..."
                  required
                />
              </div>

              {/* Target Audience */}
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Demographics, interests, pain points, and characteristics of ideal customers..."
                  required
                />
              </div>

              {/* Objectives */}
              <div>
                <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Objectives
                </label>
                <textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="What do you want to achieve? (e.g., increase awareness, drive sales, build community)"
                />
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <input
                  id="budget"
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., R5,000 - R10,000, Flexible, TBD"
                />
              </div>

              {/* Custom Links Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Links
                </label>
                <p className="text-xs text-gray-600 mb-4">
                  Add links to Google Drive folders, Google Forms, Notion pages, or any other relevant resources
                </p>

                {/* Add New Link Form */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Link</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Link title (e.g., Brand Assets Folder)"
                        value={newLink.title}
                        onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        placeholder="URL (e.g., https://drive.google.com/...)"
                        value={newLink.url}
                        onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newLink.description}
                      onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={addCustomLink}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" />
                      Add Link
                    </button>
                  </div>
                </div>

                {/* Links List */}
                {customLinks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Added Links ({customLinks.length})</h4>
                      <p className="text-xs text-gray-500">Click links to open in new tab</p>
                    </div>
                    
                    {customLinks.map((link) => (
                      <div key={link.id} className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                        {editingLinkId === link.id ? (
                          <EditLinkForm
                            link={link}
                            onSave={(updatedLink) => updateCustomLink(link.id, updatedLink)}
                            onCancel={() => setEditingLinkId(null)}
                          />
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="text-2xl flex-shrink-0 mt-1">
                                {getLinkIcon(link.url)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-gray-900 truncate">{link.title}</h5>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 transition-colors"
                                    title="Open link"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                                <p className="text-sm text-gray-600 truncate mb-1">{link.url}</p>
                                {link.description && (
                                  <p className="text-xs text-gray-500">{link.description}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Link Actions */}
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => copyLinkToClipboard(link.url)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Copy link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingLinkId(link.id)}
                                className="p-2 text-gray-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                                title="Edit link"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeCustomLink(link.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Quick Link Templates */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Quick Add Common Links:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button
                          onClick={() => setNewLink({
                            title: 'Google Drive Folder',
                            url: 'https://drive.google.com/',
                            description: 'Shared folder with brand assets'
                          })}
                          className="text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          📁 Google Drive Folder
                        </button>
                        <button
                          onClick={() => setNewLink({
                            title: 'Client Feedback Form',
                            url: 'https://forms.google.com/',
                            description: 'Form for client feedback and approvals'
                          })}
                          className="text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          📋 Google Form
                        </button>
                        <button
                          onClick={() => setNewLink({
                            title: 'Project Notion Page',
                            url: 'https://notion.so/',
                            description: 'Project documentation and notes'
                          })}
                          className="text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          📓 Notion Page
                        </button>
                        <button
                          onClick={() => setNewLink({
                            title: 'Design Mockups',
                            url: 'https://figma.com/',
                            description: 'Design files and mockups'
                          })}
                          className="text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          🎨 Figma/Design File
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload images, documents, or reference materials
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Supported: Images, PDF, Word, Excel, PowerPoint, Text, Archives
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Files
                  </button>
                </div>

                {/* Enhanced File List with Access Options */}
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Attached Files ({formData.files.length})</h4>
                      <p className="text-xs text-gray-500">Click to open with default program</p>
                    </div>
                    
                    {formData.files.map((file, index) => (
                      <div key={index} className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="text-2xl flex-shrink-0">
                              {getFileIcon(file)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span>{file.type || 'Unknown type'}</span>
                                <span>•</span>
                                <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* File Actions */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openFile(file)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Open with default program"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadFile(file)}
                              className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Quick Preview for Images */}
                        {file.type.startsWith('image/') && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openFile(file)}
                              onLoad={(e) => {
                                // Clean up the URL after the image loads
                                setTimeout(() => {
                                  URL.revokeObjectURL((e.target as HTMLImageElement).src);
                                }, 1000);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* File Management Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        💡 Tip: Files will open with your system's default programs
                      </p>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, files: [] }))}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear All Files
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any additional requirements, preferences, or special instructions..."
                />
              </div>
            </>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Client Management Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Client Management</h3>
            <div className="space-y-3">
              <Link
                to="/clients"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                View All Clients
              </Link>
              <Link
                to="/clients/new"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Client
              </Link>
              {selectedClientId && (
                <Link
                  to={`/clients/${selectedClientId}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Selected Client
                </Link>
              )}
            </div>
          </div>

          {/* Save to Client Profile */}
          {selectedClientId && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Save Brief to Client</h3>
              <p className="text-sm text-gray-600 mb-4">
                Save this brief information directly to the client's profile notes and add relevant tags.
              </p>
              <button
                onClick={saveToClient}
                disabled={!selectedClientId || !formData.businessName}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save className="w-5 h-5 mr-2" />
                Save to Client Profile
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Brief will be added to client notes with tags: "brief-completed", "requirements-gathered"
              </p>
            </div>
          )}

          {/* Brief Summary */}
          {selectedClientId && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Brief Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{selectedClient?.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Business:</span>
                  <span className="font-medium">{formData.businessName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timeline:</span>
                  <span className="font-medium">{formData.timeline || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">{formData.budget || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Links:</span>
                  <span className="font-medium">{customLinks.length} added</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Files:</span>
                  <span className="font-medium">{formData.files.length} attached</span>
                </div>
              </div>
            </div>
          )}

          {/* Integration Info */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Client Integration</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• <strong>📝 Brief:</strong> Saved to client profile notes</p>
                  <p>• <strong>🏷️ Tags:</strong> Auto-tagged for easy filtering</p>
                  <p>• <strong>🔗 Links:</strong> Reference materials preserved</p>
                  <p>• <strong>📎 Files:</strong> File list included in notes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links Help */}
          {customLinks.length > 0 && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <LinkIcon className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Reference Links</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>• <strong>🔗 Click:</strong> Opens link in new tab</p>
                    <p>• <strong>📋 Copy:</strong> Copies URL to clipboard</p>
                    <p>• <strong>✏️ Edit:</strong> Modify title, URL, or description</p>
                    <p>• <strong>🗑️ Remove:</strong> Delete from brief</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Access Help */}
          {formData.files.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <div className="flex items-start space-x-3">
                <FolderOpen className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">File Access</h3>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p>• <strong>👁️ View:</strong> Opens with default system program</p>
                    <p>• <strong>⬇️ Download:</strong> Saves to your Downloads folder</p>
                    <p>• <strong>🗑️ Remove:</strong> Removes from this brief only</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit Link Form Component
function EditLinkForm({ 
  link, 
  onSave, 
  onCancel 
}: { 
  link: CustomLink; 
  onSave: (link: Omit<CustomLink, 'id'>) => void; 
  onCancel: () => void; 
}) {
  const [editData, setEditData] = useState({
    title: link.title,
    url: link.url,
    description: link.description || '',
  });

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Link title"
          value={editData.title}
          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
        <input
          type="url"
          placeholder="URL"
          value={editData.url}
          onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>
      <input
        type="text"
        placeholder="Description (optional)"
        value={editData.description}
        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}