import React, { useState } from 'react';
import { Sparkles, Copy, Save, RefreshCw, FileText, Settings, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { aiService } from '../../services/aiService';

interface GeneratedContent {
  headline: string;
  body: string;
  callToAction: string;
}

export function PostTemplateGenerator() {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    goal: '',
    productName: '',
    tone: '',
    clientId: '',
    includeClientContext: true,
    additionalContext: '',
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMethod, setGenerationMethod] = useState<'ai' | 'template'>('ai');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  const goals = [
    { value: 'awareness', label: 'Brand Awareness', description: 'Introduce and build recognition' },
    { value: 'sales', label: 'Drive Sales', description: 'Convert prospects to customers' },
    { value: 'launch', label: 'Product Launch', description: 'Announce new products/services' },
    { value: 'engagement', label: 'Boost Engagement', description: 'Encourage interaction and sharing' },
    { value: 'education', label: 'Educate Audience', description: 'Share knowledge and insights' },
    { value: 'community', label: 'Build Community', description: 'Foster connections and loyalty' },
  ];

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative, business-focused' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly, casual, approachable' },
    { value: 'sa-localized', label: 'SA Localized', description: 'Authentically South African voice' },
    { value: 'friendly', label: 'Friendly & Approachable', description: 'Warm, welcoming, personal' },
    { value: 'authoritative', label: 'Expert & Authoritative', description: 'Knowledgeable, credible, trusted' },
    { value: 'playful', label: 'Fun & Playful', description: 'Energetic, entertaining, lighthearted' },
  ];

  const aiInfo = aiService.getProviderInfo();
  const isAIEnabled = aiService.isAIEnabled();

  const generateContent = async () => {
    if (!formData.goal || !formData.productName || !formData.tone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    try {
      // Get client context if selected and enabled
      let clientContext = {};
      if (formData.clientId && formData.includeClientContext) {
        const client = state.clients.find(c => c.id === formData.clientId);
        if (client) {
          clientContext = {
            clientName: client.name,
            businessType: client.businessType,
            // Extract target audience from client notes if available
            targetAudience: client.notes.includes('target') || client.notes.includes('audience') 
              ? client.notes.split('\n').find(line => 
                  line.toLowerCase().includes('target') || line.toLowerCase().includes('audience')
                )?.trim() 
              : undefined,
          };
        }
      }

      const generationParams = {
        goal: formData.goal,
        productName: formData.productName,
        tone: formData.tone,
        additionalContext: formData.additionalContext,
        ...clientContext,
      };

      const content = await aiService.generateContent(generationParams);
      setGeneratedContent(content);
      setGenerationMethod(isAIEnabled ? 'ai' : 'template');
    } catch (error) {
      console.error('Content generation failed:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const saveToContentVault = () => {
    if (!generatedContent || !formData.clientId) {
      alert('Please select a client and generate content first');
      return;
    }

    const client = state.clients.find(c => c.id === formData.clientId);
    const fullCaption = `${generatedContent.headline}\n\n${generatedContent.body}\n\n${generatedContent.callToAction}`;

    const contentItem = {
      id: Date.now().toString(),
      clientId: formData.clientId,
      title: `${formData.goal.charAt(0).toUpperCase() + formData.goal.slice(1)} Post - ${formData.productName}`,
      caption: fullCaption,
      image: '',
      tags: [formData.goal, formData.tone, generationMethod === 'ai' ? 'ai-generated' : 'template-generated'],
      status: 'ready' as const,
      createdBy: generationMethod === 'ai' ? 'AI Assistant' : 'Template Generator',
      assignedToPostId: '',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CONTENT_ITEM', payload: contentItem });
    
    // Show success feedback
    setCopyFeedback('Saved to vault!');
    setTimeout(() => setCopyFeedback(''), 3000);
  };

  const generateNewVariation = async () => {
    if (!formData.goal || !formData.productName || !formData.tone) {
      alert('Please fill in the required fields first');
      return;
    }
    
    // Simply call generateContent again to get a new variation
    await generateContent();
  };

  const selectedClient = state.clients.find(c => c.id === formData.clientId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-primary-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Post Template Generator</h2>
            <p className="text-sm text-gray-600">Generate engaging post content with AI assistance</p>
          </div>
        </div>
        
        {/* AI Status and Settings */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
            isAIEnabled 
              ? 'bg-success-50 text-success-700 border border-success-200' 
              : 'bg-warning-50 text-warning-700 border border-warning-200'
          }`}>
            {isAIEnabled ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="font-medium">{aiInfo.provider}</span>
            <span className="text-xs opacity-75">({aiInfo.model})</span>
          </div>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showAdvanced 
                ? 'text-primary-600 bg-primary-100 border border-primary-300 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
            title="Advanced Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Copy/Save Feedback */}
      {copyFeedback && (
        <div className="fixed top-4 right-4 bg-success-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-down">
          {copyFeedback}
        </div>
      )}

      {/* AI Configuration Notice */}
      {!isAIEnabled && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">AI Enhancement Available</h3>
              <p className="text-sm text-blue-800 mb-3">
                To enable AI-powered content generation, add your OpenAI API key to the environment variables. 
                Currently using enhanced template system with {goals.length * tones.length * 2}+ variations.
              </p>
              <div className="bg-blue-100 rounded-lg p-3 font-mono text-xs text-blue-900">
                <p className="mb-1">Add to your .env file:</p>
                <p>VITE_OPENAI_API_KEY=your-api-key-here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Client Selection */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
              Client (for context & saving)
            </label>
            <select
              id="client"
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a client (optional)</option>
              {state.clients.map(client => (
                <option key={client.id} value={client.id}>{client.name} - {client.businessType}</option>
              ))}
            </select>
            
            {/* Client Context Toggle */}
            {formData.clientId && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeContext"
                  checked={formData.includeClientContext}
                  onChange={(e) => setFormData(prev => ({ ...prev, includeClientContext: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="includeContext" className="text-sm text-gray-600">
                  Use client information for personalized content
                </label>
              </div>
            )}
            
            {/* Selected Client Preview */}
            {selectedClient && formData.includeClientContext && (
              <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-sm text-primary-800">
                  <strong>Context:</strong> {selectedClient.name} ({selectedClient.businessType})
                  {selectedClient.notes && (
                    <span className="block mt-1 text-xs opacity-75">
                      Additional context from client notes will be included
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Goal Selection */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Post Goal *
            </label>
            <select
              id="goal"
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a goal</option>
              {goals.map(goal => (
                <option key={goal.value} value={goal.value}>
                  {goal.label} - {goal.description}
                </option>
              ))}
            </select>
          </div>

          {/* Product/Service Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Product or Service Name *
            </label>
            <input
              id="productName"
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Premium Coffee Blend, Marketing Consultation"
              required
            />
          </div>

          {/* Tone Selection */}
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
              Tone & Style *
            </label>
            <select
              id="tone"
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a tone</option>
              {tones.map(tone => (
                <option key={tone.value} value={tone.value}>
                  {tone.label} - {tone.description}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Advanced Options</h3>
              </div>
              
              <div>
                <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context & Requirements
                </label>
                <textarea
                  id="additionalContext"
                  value={formData.additionalContext}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any specific details, target audience info, special requirements, or creative direction..."
                />
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p className="flex items-center space-x-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{isAIEnabled 
                      ? 'AI will use this context to create more personalized and relevant content'
                      : 'This will influence template selection and customization'
                    }</span>
                  </p>
                  <p className="flex items-center space-x-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Examples: "Target young professionals", "Include urgency", "Mention local delivery"</span>
                  </p>
                </div>
              </div>

              {/* AI-specific advanced options */}
              {isAIEnabled && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-primary-600" />
                    <span>AI Enhancement Features</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">Dynamic personalization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">Context-aware messaging</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">SA localization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">Unlimited variations</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Template system info */}
              {!isAIEnabled && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-warning-600" />
                    <span>Template System Features</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">{goals.length * tones.length * 2}+ variations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">Professional copywriting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">SA localized options</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                      <span className="text-gray-700">Instant generation</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateContent}
            disabled={isGenerating || !formData.goal || !formData.productName || !formData.tone}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                {isAIEnabled ? 'AI Generating...' : 'Generating...'}
              </>
            ) : (
              <>
                {isAIEnabled ? <Zap className="w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                {isAIEnabled ? 'Generate with AI' : 'Generate Content'}
              </>
            )}
          </button>
        </div>

        {/* Generated Content */}
        <div className="space-y-6">
          {generatedContent ? (
            <>
              {/* Generation Method Indicator */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                  generationMethod === 'ai' 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {generationMethod === 'ai' ? (
                    <>
                      <Zap className="w-3 h-3" />
                      <span>AI Generated</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Template Based</span>
                    </>
                  )}
                </div>
              </div>

              {/* Headline */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Headline</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{generatedContent.headline.length}/60</span>
                    <button
                      onClick={() => copyToClipboard(generatedContent.headline)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-800 font-medium">{generatedContent.headline}</p>
              </div>

              {/* Body */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Post Body</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{generatedContent.body.length}/280</span>
                    <button
                      onClick={() => copyToClipboard(generatedContent.body)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{generatedContent.body}</p>
              </div>

              {/* Call to Action */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Call to Action</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{generatedContent.callToAction.length}/50</span>
                    <button
                      onClick={() => copyToClipboard(generatedContent.callToAction)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-primary-600 font-medium">{generatedContent.callToAction}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(`${generatedContent.headline}\n\n${generatedContent.body}\n\n${generatedContent.callToAction}`)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </button>
                <button
                  onClick={saveToContentVault}
                  disabled={!formData.clientId}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Vault
                </button>
              </div>

              {/* Regenerate Button */}
              <button
                onClick={generateNewVariation}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Variation
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600 mb-4">
                Fill in the form and click generate to create your post content
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">
                  {isAIEnabled ? 'AI-Powered Features:' : 'Template Features:'}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {isAIEnabled ? (
                    <>
                      <li>• Personalized content based on client context</li>
                      <li>• Dynamic adaptation to your specific requirements</li>
                      <li>• Authentic South African localization</li>
                      <li>• Unlimited unique variations</li>
                      <li>• Context-aware tone and messaging</li>
                    </>
                  ) : (
                    <>
                      <li>• {goals.length * tones.length * 2}+ pre-written variations</li>
                      <li>• Professional copywriting templates</li>
                      <li>• South African localized options</li>
                      <li>• Multiple tones and styles</li>
                      <li>• Instant generation</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}