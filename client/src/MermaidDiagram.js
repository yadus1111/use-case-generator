import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});

const MermaidDiagram = ({ mermaidCode, title = "Use Case Diagram" }) => {
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mermaidCode) {
      const renderDiagram = async () => {
        try {
          // Clear any existing content
          setSvgContent('');
          setError('');

          // Render the Mermaid diagram
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, mermaidCode);
          setSvgContent(svg);
        } catch (err) {
          console.error('Mermaid rendering error:', err);
          setError('Failed to render diagram: ' + err.message);
        }
      };

      renderDiagram();
    }
  }, [mermaidCode]);

  if (error) {
    return (
      <div className="mermaid-diagram">
        <div className="diagram-container">
          <div className="diagram-title">
            <h3>{title}</h3>
            <p>Professional Use Case Diagram for Digital Wallet System</p>
          </div>
          <div className="diagram-error">
            <AlertTriangle size={48} color="#e74c3c" />
            <h4>Diagram Rendering Error</h4>
            <p>{error}</p>
            <details>
              <summary>Mermaid Code</summary>
              <pre className="mermaid-code">{mermaidCode}</pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="mermaid-diagram">
        <div className="diagram-container">
          <div className="diagram-title">
            <h3>{title}</h3>
            <p>Professional Use Case Diagram for Digital Wallet System</p>
          </div>
          <div className="diagram-loading">
            <RefreshCw size={48} className="loading-spinner" />
            <p>Generating diagram...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mermaid-diagram">
      <div className="diagram-container">
        <div className="diagram-title">
          <h3>{title}</h3>
          <p>Professional Use Case Diagram for Digital Wallet System</p>
        </div>
        <div className="diagram-svg-container">
          <div 
            className="mermaid-svg-container"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
        <div className="diagram-legend">
          <div className="legend-section">
            <h4>📊 Mermaid Diagram Elements</h4>
            <div className="legend-grid">
              <div className="legend-item">
                <div className="legend-symbol actor-symbol"></div>
                <span><strong>Actors:</strong> Users, systems, or external entities that interact with the system</span>
              </div>
              <div className="legend-item">
                <div className="legend-symbol usecase-symbol"></div>
                <span><strong>Use Cases:</strong> System functions or features that provide value to actors</span>
              </div>
              <div className="legend-item">
                <div className="legend-symbol datastore-symbol"></div>
                <span><strong>Data Stores:</strong> Databases, files, or data repositories used by the system</span>
              </div>
              <div className="legend-item">
                <div className="legend-symbol relationship-symbol"></div>
                <span><strong>Relationships:</strong> Interactions and dependencies between actors and use cases</span>
              </div>
            </div>
          </div>
          <div className="legend-section">
            <h4>ℹ️ Diagram Information</h4>
            <div className="system-info">
              <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Type:</strong> Mermaid Use Case Diagram</p>
              <p><strong>Theme:</strong> Professional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidDiagram; 