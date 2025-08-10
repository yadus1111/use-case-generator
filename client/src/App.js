import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import MermaidDiagram from './MermaidDiagram';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronLeft,
  TrendingUp,
  Users,
  Shield,
  MapPin,
  Clock,
  Target,
  Zap,
  PieChart,
  BarChart3,
  Lightbulb,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  User,
  Settings,
  GitBranch,
  CheckCircle,
  Play,
  Wrench,
  Database,
  BarChart,
  AlertTriangle,
  Calendar,
  Activity,
  FileText as FileTextIcon,
  Info,
  DollarSign
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [useCases, setUseCases] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedUseCase, setExpandedUseCase] = useState(null);
  const [businessProblem, setBusinessProblem] = useState('');
  const [businessScenario, setBusinessScenario] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const fileInputRef = useRef(null);



  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      setCsvData(null);
      setUseCases(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('businessProblem', businessProblem);
    formData.append('businessScenario', businessScenario);

    try {
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      // Try the new upload endpoint first, fallback to original if needed
      let response;
      try {
        response = await axios.post('/api/upload-v2', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 second timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          }
        });
      } catch (error) {
        console.log('Upload-v2 failed, trying original endpoint:', error.message);
        // Fallback to original endpoint
        response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 second timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          }
        });
      }

      console.log('Upload response received:', response.status);
      
      if (response.data.success) {
        setCsvData(response.data.data);
        setUseCases(response.data.useCases);
        setSuccess('File uploaded and use cases generated successfully!');
        console.log('Use cases generated:', response.data.useCases.length);
      } else {
        setError('Failed to process file: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (error.code === 'ECONNRESET') {
        setError('Connection was reset. Please check if the server is running and try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.status, error.response.data);
        setError(`Server error (${error.response.status}): ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        setError('No response from server. Please check if the backend server is running on port 5000.');
      } else {
        // Something else happened
        setError('An unexpected error occurred: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvData(null);
    setUseCases(null);
    setError(null);
    setSuccess(null);
    setBusinessProblem('');
    setBusinessScenario('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      'chart-line': TrendingUp,
      'users': Users,
      'shield': Shield,
      'map-pin': MapPin,
      'clock': Clock,
      'trending-up': TrendingUp,
      'target': Target,
      'zap': Zap,
      'pie-chart': PieChart,
      'bar-chart': BarChart3,
      'lightbulb': Lightbulb
    };
    return iconMap[iconName] || Lightbulb;
  };

  const toggleUseCaseExpansion = (index) => {
    setExpandedUseCase(expandedUseCase === index ? null : index);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const downloadUseCases = () => {
    if (!useCases) return;

    const content = useCases.map((useCase, index) => {
      return `${index + 1}. ${useCase.title}\n\n` +
        `Description: ${useCase.description}\n\n` +
        `Business Impact: ${useCase.businessImpact}\n\n` +
        `Priority: ${useCase.priority}\n\n` +
        `Implementation Summary:\n` +
        `This use case focuses on leveraging digital wallet transaction data to create business value for the Nepali market. ` +
        `The implementation should consider local market conditions, regulatory requirements, and user behavior patterns specific to Nepal.\n\n` +
        `Next Steps:\n` +
        `- Conduct market research to validate the business case\n` +
        `- Develop detailed technical specifications\n` +
        `- Create a project timeline and resource plan\n` +
        `- Define success metrics and KPIs\n` +
        `- Plan for regulatory compliance and security measures\n\n`;
    }).join('---\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structured-use-cases.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadUseCasePDF = async (useCase, index) => {
    console.log('Starting PDF download for use case:', index, useCase.title);
    console.log('Use case object:', useCase);
    
    setPdfGenerating(true);
    
    try {
      // First, ensure the use case is expanded to show all content
      if (expandedUseCase !== index) {
        setExpandedUseCase(index);
        // Wait for the expansion to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Find the use case card element
      const useCaseElement = document.getElementById(`use-case-${index}`);
      if (!useCaseElement) {
        throw new Error('Use case element not found');
      }
      
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px'; // Fixed width for consistent PDF
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '20px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '14px';
      tempContainer.style.lineHeight = '1.6';
      tempContainer.style.color = '#333';
      
      // Clone the use case content
      const clonedContent = useCaseElement.cloneNode(true);
      
      // Remove any interactive elements that shouldn't be in PDF
      const buttons = clonedContent.querySelectorAll('button');
      buttons.forEach(button => button.remove());
      
      // Add PDF-specific styling
      clonedContent.style.margin = '0';
      clonedContent.style.padding = '0';
      clonedContent.style.boxShadow = 'none';
      clonedContent.style.border = '1px solid #ddd';
      clonedContent.style.borderRadius = '8px';
      clonedContent.classList.add('pdf-capture');
      
      // Add header for PDF
      const header = document.createElement('div');
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">Use Case Report</h1>
          <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 16px;">Generated by Use Case Generator</p>
          <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">${new Date().toLocaleString()}</p>
        </div>
      `;

      tempContainer.appendChild(header);
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
      
      // Wait for any async content to load (especially Mermaid diagrams)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture the content as canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        windowHeight: tempContainer.scrollHeight
      });
      
      // Remove the temporary container
      document.body.removeChild(tempContainer);

      // Create PDF with proper page breaks
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the image to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `${useCase.title.replace(/[^a-zA-Z0-9]/g, '_')}_UseCase_Report.pdf`;
      pdf.save(fileName);
      console.log('PDF generated successfully for:', useCase.title);
      
      // Show success message
      alert(`PDF Report generated successfully: ${fileName}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      alert(`Error generating PDF: ${error.message}. Please try again.`);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Function to render use case diagram in UI
  const renderUseCaseDiagram = (useCase) => {
    if (!useCase.mermaidDiagram) return null;

    return (
      <MermaidDiagram 
        mermaidCode={useCase.mermaidDiagram} 
        title={`${useCase.title} - Use Case Diagram`}
      />
    );
  };




  return (
    <div className="App">
      <div className="container">
        <header className="card">
          <h1>
            <Lightbulb size={32} />
            Use Case Generator
          </h1>
          <p>Upload your fintech transaction data and get a structured overview of comprehensive use cases. Download detailed PDF reports for complete analysis with diagrams and timelines.</p>
        </header>

        <div className="card">
          <h2>
            <Target size={24} />
            Business Context
          </h2>
          
          <div className="input-group">
            <label htmlFor="businessProblem">
              <AlertTriangle size={16} />
              Business Problem
            </label>
            <textarea
              id="businessProblem"
              value={businessProblem}
              onChange={(e) => setBusinessProblem(e.target.value)}
              placeholder="Describe the main business problem or challenge you're trying to solve (e.g., 'Need to reduce fraud in mobile payments', 'Want to increase user engagement')"
              rows={3}
              className="form-input"
            />
            <small>This helps generate more targeted and relevant use cases</small>
          </div>

          <div className="input-group">
            <label htmlFor="businessScenario">
              <MapPin size={16} />
              Business Scenario
            </label>
            <textarea
              id="businessScenario"
              value={businessScenario}
              onChange={(e) => setBusinessScenario(e.target.value)}
              placeholder="Describe your business scenario or context (e.g., 'Operating in Nepal with focus on mobile payments', 'Targeting rural areas with limited banking access')"
              rows={3}
              className="form-input"
            />
            <small>This provides context for generating location and market-specific use cases</small>
          </div>
        </div>

        <div className="card">
          <h2>
            <Upload size={24} />
            Upload CSV File
          </h2>
          
          <div
            className={`file-upload ${isDragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
            />
            <Upload size={48} color="#667eea" />
            <p>
              {file ? `Selected: ${file.name}` : 'Click to select or drag and drop a CSV file'}
            </p>
            <small>Expected columns: user_id, transaction_id, amount, location, timestamp, merchant_type</small>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Generating Use Cases...
                </>
              ) : (
                <>
                  <Lightbulb size={20} />
                  Generate Use Cases
                </>
              )}
            </button>
            
            {file && (
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                <RefreshCw size={20} />
                Reset
              </button>
            )}
          </div>
        </div>

        {csvData && (
          <div className="card">
            <h2>
              <FileText size={24} />
              Data Preview (First 5 Rows)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="preview-table">
                <thead>
                  <tr>
                    {Object.keys(csvData[0]).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, valueIndex) => (
                        <td key={valueIndex}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: '12px', color: '#6c757d', fontSize: '14px' }}>
              Total rows: {csvData.length}
            </p>
          </div>
        )}

        {useCases && (
          <div className="use-cases-section">
            <div className="section-header">
              <h2>Generated Use Cases</h2>
              <p className="section-description">
                Your fintech transaction data has been analyzed to generate comprehensive use cases. 
                Each use case is displayed individually with detailed information, diagrams, and implementation guidance.
              </p>
              <div className="download-actions">
                <button 
                  onClick={downloadUseCases} 
                  className="download-btn secondary"
                >
                  <Download className="icon" />
                  Download All (TXT)
                </button>
                <div className="pdf-note">
                  <Info className="icon" />
                  <span>For detailed reports with diagrams and timelines, download individual PDFs below</span>
                </div>
              </div>
            </div>

            <div className="use-cases-single-view">
              {useCases.map((useCase, index) => (
                <div key={index} id={`use-case-${index}`} className="use-case-full-card">
                  {/* Header Section */}
                  <div className="use-case-header">
                    <div className="header-main">
                      <div className="title-section">
                        <h3 className="use-case-title">{useCase.title}</h3>
                        <span className={`priority-badge ${useCase.priority?.toLowerCase()}`}>
                          {useCase.priority}
                        </span>
                     </div>
                      <div className="header-actions">
                                           <button 
                       onClick={() => toggleUseCaseExpansion(index)}
                       className="expand-btn"
                     >
                        {expandedUseCase === index ? <ChevronUp /> : <ChevronDown />}
                          {expandedUseCase === index ? 'Collapse' : 'Expand'}
                        </button>
                        <button 
                          onClick={() => downloadUseCasePDF(useCase, index)}
                          className="download-pdf-btn"
                          disabled={pdfGenerating}
                        >
                          {pdfGenerating ? (
                            <>
                              <div className="spinner"></div>
                              Generating PDF...
                            </>
                          ) : (
                            <>
                              <FileText className="icon" />
                              Download PDF Report
                            </>
                          )}
                      </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="use-case-summary">
                    <div className="summary-grid">
                    <div className="summary-item">
                      <Target className="icon" />
                        <div className="summary-content">
                          <span className="summary-label">Priority</span>
                          <span className="summary-value">{useCase.priority}</span>
                        </div>
                    </div>
                    <div className="summary-item">
                      <Users className="icon" />
                        <div className="summary-content">
                          <span className="summary-label">Type</span>
                          <span className="summary-value">Business Use Case</span>
                        </div>
                    </div>
                    <div className="summary-item">
                      <Clock className="icon" />
                        <div className="summary-content">
                          <span className="summary-label">Status</span>
                          <span className="summary-value">Generated</span>
                        </div>
                    </div>
                    <div className="summary-item">
                      <BarChart3 className="icon" />
                        <div className="summary-content">
                          <span className="summary-label">Impact</span>
                          <span className="summary-value">High</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="use-case-description">
                    <h4>📝 Description</h4>
                    <p>{useCase.description}</p>
                  </div>

                  {/* Business Impact Section */}
                  <div className="use-case-impact">
                    <h4>💼 Business Impact</h4>
                    <p>{useCase.businessImpact}</p>
                  </div>

                  {/* Expanded Details */}
                  {expandedUseCase === index && (
                    <div className="expanded-details">
                      {/* Use Case Details */}
                      <div className="detail-section">
                        <h4> Detailed Requirements</h4>
                        <div className="requirements-grid">
                          <div className="requirement-item">
                              <CheckCircle className="icon" />
                            <div className="requirement-content">
                              <span className="requirement-label">Title</span>
                              <span className="requirement-value">{useCase.title}</span>
                            </div>
                        </div>
                          <div className="requirement-item">
                            <CheckCircle className="icon" />
                            <div className="requirement-content">
                              <span className="requirement-label">Description</span>
                              <span className="requirement-value">{useCase.description}</span>
                      </div>
                            </div>
                          <div className="requirement-item">
                            <CheckCircle className="icon" />
                            <div className="requirement-content">
                              <span className="requirement-label">Business Impact</span>
                              <span className="requirement-value">{useCase.businessImpact}</span>
                        </div>
                      </div>
                          <div className="requirement-item">
                            <CheckCircle className="icon" />
                            <div className="requirement-content">
                              <span className="requirement-label">Priority</span>
                              <span className="requirement-value">{useCase.priority}</span>
                        </div>
                      </div>
                            </div>
                          </div>
                          
                      {/* Use Case Diagram */}
                      {useCase.mermaidDiagram && (
                        <div className="detail-section">
                          <h4> Use Case Diagram</h4>
                          <MermaidDiagram mermaidCode={useCase.mermaidDiagram} title={`${useCase.title} - Use Case Diagram`} />
                                    </div>
                                  )}

                      {/* Implementation Summary */}
                      <div className="detail-section">
                        <h4>🎯 Implementation Summary</h4>
                        <div className="implementation-content">
                          <div className="implementation-item">
                            <Target className="icon" />
                            <span>This use case focuses on leveraging digital wallet transaction data to create business value for the Nepali market.</span>
                              </div>
                          <div className="implementation-item">
                            <Target className="icon" />
                            <span>The implementation should consider local market conditions, regulatory requirements, and user behavior patterns specific to Nepal.</span>
                            </div>
                          <div className="implementation-item">
                            <Target className="icon" />
                            <span>Success will be measured by increased user engagement, transaction volume, and merchant partnerships.</span>
                          </div>
                        </div>
                      </div>

                      {/* Next Steps */}
                      <div className="detail-section">
                        <h4>💡 Next Steps</h4>
                        <div className="next-steps-grid">
                          <div className="step-item">
                            <TrendingUp className="icon" />
                            <span>Conduct market research to validate the business case</span>
                          </div>
                          <div className="step-item">
                            <Users className="icon" />
                            <span>Develop detailed technical specifications</span>
                          </div>
                          <div className="step-item">
                            <DollarSign className="icon" />
                            <span>Create a project timeline and resource plan</span>
                          </div>
                          <div className="step-item">
                            <Target className="icon" />
                            <span>Define success metrics and KPIs</span>
                          </div>
                          <div className="step-item">
                            <Shield className="icon" />
                            <span>Plan for regulatory compliance and security measures</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 