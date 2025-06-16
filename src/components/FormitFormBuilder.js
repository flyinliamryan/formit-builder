import React, { useState } from 'react';
import { 
  Type, Mail, Phone, Calendar, MapPin, MessageSquare, 
  CheckSquare, Circle, List, FileText, Hash, Star,
  Trash2, Settings, Copy, Eye, Code, Download, Plus,
  ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';

const FormitFormBuilder = () => {
  const [formFields, setFormFields] = useState([]);
  const [formSettings, setFormSettings] = useState({
    formName: 'contact_form',
    redirectTo: 'thank-you',
    emailTo: 'admin@example.com',
    emailSubject: 'New Form Submission',
    validate: true,
    spam: true
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [selectedField, setSelectedField] = useState(null);

  // Available field types
  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type, category: 'basic' },
    { type: 'email', label: 'Email', icon: Mail, category: 'basic' },
    { type: 'tel', label: 'Phone', icon: Phone, category: 'basic' },
    { type: 'textarea', label: 'Textarea', icon: MessageSquare, category: 'basic' },
    { type: 'select', label: 'Dropdown', icon: List, category: 'choice' },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'choice' },
    { type: 'radio', label: 'Radio Buttons', icon: Circle, category: 'choice' },
    { type: 'date', label: 'Date', icon: Calendar, category: 'advanced' },
    { type: 'number', label: 'Number', icon: Hash, category: 'advanced' },
    { type: 'file', label: 'File Upload', icon: FileText, category: 'advanced' },
    { type: 'hidden', label: 'Hidden Field', icon: Eye, category: 'advanced' }
  ];

  // Generate unique ID
  const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add field to form
  const addField = (fieldType) => {
    const newField = {
      id: generateId(),
      type: fieldType.type,
      label: fieldType.label,
      name: fieldType.type === 'email' ? 'email' : fieldType.type === 'tel' ? 'phone' : fieldType.type.toLowerCase(),
      placeholder: '',
      required: false,
      validation: '',
      options: fieldType.category === 'choice' ? ['Option 1', 'Option 2'] : [],
      cssClass: 'form-control',
      description: '',
      defaultValue: ''
    };
    setFormFields([...formFields, newField]);
    setSelectedField(newField.id);
  };

  // Update field
  const updateField = (id, updates) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  // Remove field
  const removeField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
    setSelectedField(null);
  };

  // Duplicate field
  const duplicateField = (id) => {
    const field = formFields.find(f => f.id === id);
    if (field) {
      const duplicated = { ...field, id: generateId(), name: field.name + '_copy' };
      const index = formFields.findIndex(f => f.id === id);
      const newFields = [...formFields];
      newFields.splice(index + 1, 0, duplicated);
      setFormFields(newFields);
    }
  };

  // Move field up/down
  const moveField = (id, direction) => {
    const index = formFields.findIndex(f => f.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;
    
    const newFields = [...formFields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFormFields(newFields);
  };

  // Generate FormIt validation rules
  const generateValidation = () => {
    const validationRules = [];
    formFields.forEach(field => {
      if (field.required) {
        validationRules.push(`${field.name}:required`);
      }
      if (field.type === 'email') {
        validationRules.push(`${field.name}:email`);
      }
      if (field.validation) {
        validationRules.push(`${field.name}:${field.validation}`);
      }
    });
    return validationRules.join(',');
  };

  // Generate FormIt snippet call
  const generateFormitCode = () => {
    const validation = generateValidation();
    
    return `[[!FormIt? 
  &hooks=\`spam,email,redirect\`
  &emailTpl=\`${formSettings.formName}_email\`
  &emailTo=\`${formSettings.emailTo}\`
  &emailSubject=\`${formSettings.emailSubject}\`
  &redirectTo=\`${formSettings.redirectTo}\`
  &validate=\`${validation}\`
  &validationErrorMessage=\`Please correct the errors below.\`
  &successMessage=\`Thank you! Your message has been sent.\`
]]`;
  };

  // Generate HTML form
  const generateFormHTML = () => {
    let html = `<div class="formit-form max-w-lg mx-auto">\n`;
    html += `  <input type="hidden" name="nospam:blank" value="" />\n\n`;

    formFields.forEach(field => {
      html += `  <!-- ${field.label} -->\n`;
      html += `  <div class="mb-6">\n`;
      
      if (field.type !== 'hidden' && field.type !== 'checkbox') {
        html += `    <label for="${field.name}" class="block text-sm font-medium text-gray-700 mb-2">`;
        html += `${field.label}${field.required ? ' <span class="text-red-500">*</span>' : ''}</label>\n`;
      }

      switch (field.type) {
        case 'textarea':
          html += `    <textarea name="${field.name}" id="${field.name}" `;
          html += `class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" `;
          html += `placeholder="${field.placeholder}" ${field.required ? 'required' : ''} rows="4">[[!+fi.${field.name}]]</textarea>\n`;
          break;
        case 'select':
          html += `    <select name="${field.name}" id="${field.name}" `;
          html += `class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" ${field.required ? 'required' : ''}>\n`;
          html += `      <option value="">Choose...</option>\n`;
          field.options.forEach(option => {
            html += `      <option value="${option}" [[!+fi.${field.name}:FormItIsSelected=\`${option}\`]]>${option}</option>\n`;
          });
          html += `    </select>\n`;
          break;
        case 'checkbox':
          html += `    <div class="flex items-center">\n`;
          html += `      <input type="checkbox" name="${field.name}" id="${field.name}" `;
          html += `class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" value="1" `;
          html += `[[!+fi.${field.name}:FormItIsChecked=\`1\`]] ${field.required ? 'required' : ''} />\n`;
          html += `      <label for="${field.name}" class="ml-3 text-sm font-medium text-gray-700">`;
          html += `${field.label}${field.required ? ' <span class="text-red-500">*</span>' : ''}</label>\n`;
          html += `    </div>\n`;
          break;
        case 'radio':
          field.options.forEach((option, index) => {
            html += `    <div class="flex items-center mb-2">\n`;
            html += `      <input type="radio" name="${field.name}" id="${field.name}_${index}" `;
            html += `class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" value="${option}" `;
            html += `[[!+fi.${field.name}:FormItIsSelected=\`${option}\`]] ${field.required ? 'required' : ''} />\n`;
            html += `      <label for="${field.name}_${index}" class="ml-3 text-sm font-medium text-gray-700">${option}</label>\n`;
            html += `    </div>\n`;
          });
          break;
        case 'hidden':
          html += `    <input type="hidden" name="${field.name}" value="${field.defaultValue}" />\n`;
          break;
        default:
          html += `    <input type="${field.type}" name="${field.name}" id="${field.name}" `;
          html += `class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" `;
          html += `placeholder="${field.placeholder}" value="[[!+fi.${field.name}]]" ${field.required ? 'required' : ''} />\n`;
      }

      if (field.description) {
        html += `    <p class="text-sm text-gray-500 mt-1">${field.description}</p>\n`;
      }

      html += `    [[!+fi.error.${field.name}:notempty=\`<p class="text-red-500 text-sm mt-1">[[!+fi.error.${field.name}]]</p>\`]]\n`;
      html += `  </div>\n\n`;
    });

    html += `  <div class="mb-6">\n`;
    html += `    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Submit</button>\n`;
    html += `  </div>\n`;
    html += `</div>\n\n`;
    html += `[[!+fi.validation_error_message:notempty=\`<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">[[!+fi.validation_error_message]]</div>\`]]\n`;
    html += `[[!+fi.successMessage:notempty=\`<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">[[!+fi.successMessage]]</div>\`]]`;

    return html;
  };

  // Generate email template
  const generateEmailTemplate = () => {
    let template = `<h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">New Form Submission: ${formSettings.formName}</h2>\n\n`;
    template += `<table border="0" cellpadding="12" cellspacing="0" style="border: 1px solid #e5e7eb; border-collapse: collapse; width: 100%;">\n`;
    
    formFields.forEach(field => {
      if (field.type !== 'hidden' && field.name) {
        template += `  <tr style="border-bottom: 1px solid #f3f4f6;">\n`;
        template += `    <td style="background-color: #f9fafb; font-weight: 600; color: #374151; width: 30%;">${field.label}:</td>\n`;
        template += `    <td style="color: #1f2937;">[[+${field.name}]]</td>\n`;
        template += `  </tr>\n`;
      }
    });

    template += `</table>\n\n`;
    template += `<p style="color: #6b7280; font-size: 14px; margin-top: 24px;"><em>Submitted on [[+date]] at [[+time]]</em></p>`;

    return template;
  };

  // Field editor component
  const FieldEditor = ({ field, isSelected, onSelect }) => {
    const fieldTypeData = fieldTypes.find(t => t.type === field.type);

    return (
      <div 
        className={`border-2 rounded-xl p-4 mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={() => onSelect(field.id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
              {React.createElement(fieldTypeData?.icon || Type, { size: 18 })}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{field.label || field.type}</h4>
              <p className="text-sm text-gray-500">{field.name}</p>
            </div>
            {field.required && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">Required</span>
            )}
          </div>
          <div className="flex space-x-1">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }}
              title="Move up"
            >
              <ArrowUp size={16} />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }}
              title="Move down"
            >
              <ArrowDown size={16} />
            </button>
            <button 
              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
              title="Duplicate"
            >
              <Copy size={16} />
            </button>
            <button 
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const selectedFieldData = formFields.find(f => f.id === selectedField);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="flex h-full">
        {/* Left Sidebar - Field Types */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MODX Formit Builder</h1>
                <p className="text-sm text-gray-500">Click on fields below to add</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Fields</h3>
              <div className="space-y-2">
                {fieldTypes.filter(f => f.category === 'basic').map(fieldType => (
                  <button
                    key={fieldType.type}
                    className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    onClick={() => addField(fieldType)}
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600 rounded-lg mr-3 transition-colors">
                      <fieldType.icon size={18} />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">{fieldType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Choice Fields</h3>
              <div className="space-y-2">
                {fieldTypes.filter(f => f.category === 'choice').map(fieldType => (
                  <button
                    key={fieldType.type}
                    className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                    onClick={() => addField(fieldType)}
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-green-100 text-gray-600 group-hover:text-green-600 rounded-lg mr-3 transition-colors">
                      <fieldType.icon size={18} />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-green-700">{fieldType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Advanced Fields</h3>
              <div className="space-y-2">
                {fieldTypes.filter(f => f.category === 'advanced').map(fieldType => (
                  <button
                    key={fieldType.type}
                    className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    onClick={() => addField(fieldType)}
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-purple-100 text-gray-600 group-hover:text-purple-600 rounded-lg mr-3 transition-colors">
                      <fieldType.icon size={18} />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-purple-700">{fieldType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Form Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formSettings.formName}
                    onChange={(e) => setFormSettings({...formSettings, formName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email To</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formSettings.emailTo}
                    onChange={(e) => setFormSettings({...formSettings, emailTo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formSettings.emailSubject}
                    onChange={(e) => setFormSettings({...formSettings, emailSubject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Redirect To</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formSettings.redirectTo}
                    onChange={(e) => setFormSettings({...formSettings, redirectTo: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Form Builder */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Form Builder</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    !previewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setPreviewMode(false)}
                >
                  Build
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
                    previewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setPreviewMode(true)}
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!previewMode ? (
              <div>
                {formFields.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Plus size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your form</h3>
                    <p className="text-gray-500">Click any field type from the sidebar to get started</p>
                  </div>
                ) : (
                  formFields.map((field) => (
                    <FieldEditor 
                      key={field.id} 
                      field={field} 
                      isSelected={selectedField === field.id}
                      onSelect={setSelectedField}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Form Preview</h3>
                <div className="space-y-6">
                  {formFields.map(field => (
                    <div key={field.id}>
                      {field.type !== 'hidden' && field.type !== 'checkbox' && (
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                      )}
                      
                      {field.type === 'textarea' && (
                        <textarea 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                          placeholder={field.placeholder}
                          rows="4"
                          readOnly
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" disabled>
                          <option>Choose...</option>
                          {field.options.map((option, i) => (
                            <option key={i}>{option}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.type === 'checkbox' && (
                        <div className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" disabled />
                          <label className="ml-3 text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                        </div>
                      )}
                      
                      {field.type === 'radio' && (
                        <div className="space-y-2">
                          {field.options.map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input type="radio" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" disabled />
                              <label className="ml-3 text-sm font-medium text-gray-700">{option}</label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!['textarea', 'select', 'checkbox', 'radio', 'hidden'].includes(field.type) && (
                        <input 
                          type={field.type} 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={field.placeholder}
                          readOnly
                        />
                      )}
                      
                      {field.description && (
                        <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                      )}
                    </div>
                  ))}
                  <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors" disabled>
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* Field Editor Panel */}
            {selectedFieldData && !previewMode && (
              <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Field: {selectedFieldData.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFieldData.label}
                      onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFieldData.name}
                      onChange={(e) => updateField(selectedFieldData.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFieldData.placeholder}
                      onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CSS Class</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFieldData.cssClass}
                      onChange={(e) => updateField(selectedFieldData.id, { cssClass: e.target.value })}
                    />
                  </div>
                  {['select', 'radio', 'checkbox'].includes(selectedFieldData.type) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        value={selectedFieldData.options.join('\n')}
                        onChange={(e) => updateField(selectedFieldData.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedFieldData.description}
                      onChange={(e) => updateField(selectedFieldData.id, { description: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        id={`required_${selectedFieldData.id}`}
                        checked={selectedFieldData.required}
                        onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700" htmlFor={`required_${selectedFieldData.id}`}>
                        Required field
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Generated Code */}
        <div className="w-96 bg-white shadow-xl border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Generated Code</h2>
              <button 
                className={`p-2 rounded-lg transition-colors ${
                  showCode 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setShowCode(!showCode)}
              >
                <Code size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <button 
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([generateFormHTML()], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = `${formSettings.formName}_form.html`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
              >
                <Download size={16} className="mr-2" />
                Download HTML
              </button>
              <button 
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                onClick={() => {
                  const formData = {
                    settings: formSettings,
                    fields: formFields,
                    formit_code: generateFormitCode(),
                    html: generateFormHTML(),
                    email_template: generateEmailTemplate()
                  };
                  const element = document.createElement('a');
                  const file = new Blob([JSON.stringify(formData, null, 2)], {type: 'application/json'});
                  element.href = URL.createObjectURL(file);
                  element.download = `${formSettings.formName}_complete.json`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
              >
                <Download size={16} className="mr-2" />
                Export Complete
              </button>
            </div>
          </div>

          {showCode && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">FormIt Snippet</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <textarea 
                    className="w-full bg-transparent text-green-400 font-mono text-xs resize-none border-0 outline-0"
                    rows="8"
                    readOnly
                    value={generateFormitCode()}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Form HTML</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <textarea 
                    className="w-full bg-transparent text-blue-400 font-mono text-xs resize-none border-0 outline-0"
                    rows="15"
                    readOnly
                    value={generateFormHTML()}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Email Template</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <textarea 
                    className="w-full bg-transparent text-yellow-400 font-mono text-xs resize-none border-0 outline-0"
                    rows="10"
                    readOnly
                    value={generateEmailTemplate()}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Setup Guide</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">1</div>
                  <span>Create your form above</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">2</div>
                  <span>Copy FormIt snippet code</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">3</div>
                  <span>Create MODX chunk with HTML</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">4</div>
                  <span>Set up email template</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">5</div>
                  <span>Create thank you page</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormitFormBuilder;