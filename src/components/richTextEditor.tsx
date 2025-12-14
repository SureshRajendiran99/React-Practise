import React, { useState, useRef, useEffect } from "react";

const defaultSizes = [
  "Size", "8", "9", "10", "11", "12", "13", "14", "16", "18", "20", "22", "24", "26", "28", "36", "48", "72",
];

const colorPalette = [
  "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#CCCCCC", "#D9D9D9", "#EFEFEF",
  "#F3F3F3", "#FFFFFF", "#980000", "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF",
  "#4A86E8", "#0000FF", "#9900FF", "#FF00FF", "#E6B8AF", "#F4CCCC", "#FCE5CD", "#FFF2CC",
  "#D9EAD3", "#D0E0E3", "#C9DAF8", "#CFE2F3", "#D9D2E9", "#EAD1DC",
];

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultFontSize?: string;
  availableFontSizes?: string[];
  readMode?: boolean;
  minHeight?: number;
  maxHeight?: number;
  rows?: number;
  isShowToolbarSection?: boolean;
  isShowColorPickerSection?: boolean;
  isShowFontSizeSection?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  defaultFontSize = "14px",
  availableFontSizes = defaultSizes,
  readMode = false,
  minHeight = 150,
  maxHeight = 400,
  rows = 8,
  isShowToolbarSection = true,
  isShowColorPickerSection = true,
  isShowFontSizeSection = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fontSize, setFontSize] = useState<string>("Size");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [pendingColor, setPendingColor] = useState<string>("#000000");
  const [isExpandToolbar, setIsExpandToolbar] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return false;
   
    const sel = window.getSelection();
    if (!sel) return false;
   
    if (savedRangeRef.current) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
        editor.focus();
        return true;
      } catch (e) {
        console.error("Error restoring selection:", e);
      }
    }
    return false;
  };

  const emitChange = () => {
    if (editorRef.current && onChange && !readMode) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const checkFormatting = () => {
    if (!editorRef.current) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    try {
      const boldState = document.queryCommandState('bold');
      const italicState = document.queryCommandState('italic');
      
      setIsBold(boldState);
      setIsItalic(italicState);
    } catch (e) {
      const node = sel.focusNode;
      if (!node) return;

      let checkBold = false;
      let checkItalic = false;
      let currentNode: Node | null = node.nodeType === 3 ? node.parentElement : node;
      
      while (currentNode && currentNode !== editorRef.current) {
        const element = currentNode as HTMLElement;
        
        if (element.tagName === 'B' || element.tagName === 'STRONG') {
          checkBold = true;
        }
        
        if (element.tagName === 'I' || element.tagName === 'EM') {
          checkItalic = true;
        }
        
        if (element.style) {
          const computedStyle = window.getComputedStyle(element);
          const fontWeight = computedStyle.fontWeight;
          if (fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 700) {
            checkBold = true;
          }
          
          if (computedStyle.fontStyle === 'italic') {
            checkItalic = true;
          }
        }
        
        currentNode = currentNode.parentNode;
      }
      
      setIsBold(checkBold);
      setIsItalic(checkItalic);
    }

    const node = sel.focusNode;
    if (!node) return;

    const element = node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
   
    if (computedStyle.fontSize) {
      const sizeValue = computedStyle.fontSize.replace("px", "");
      const roundedSize = Math.round(parseFloat(sizeValue)).toString();
     
      if (availableFontSizes.includes(roundedSize)) {
        setFontSize(roundedSize);
      } else {
        const defaultSizeValue = defaultFontSize.replace("px", "");
        if (roundedSize === defaultSizeValue) {
          setFontSize("Size");
        }
      }
    }
   
    if (computedStyle.color) {
      const rgb = computedStyle.color;
      const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        setTextColor(hex);
      }
    }
  };

  const handleBoldClick = () => {
    if (readMode) return;
    
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand('bold', false, undefined);
    
    setIsBold(!isBold);
    
    emitChange();
    
    setTimeout(() => {
      checkFormatting();
    }, 10);
  };

  const handleItalicClick = () => {
    if (readMode) return;
    
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand('italic', false, undefined);
    
    setIsItalic(!isItalic);
    
    emitChange();
    
    setTimeout(() => {
      checkFormatting();
    }, 10);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (readMode) return;
    const size = e.target.value;
    setFontSize(size);

    const editor = editorRef.current;
    if (!editor) return;
   
    restoreSelection();

    const appliedSize = size === "Size" ? defaultFontSize : `${size}px`;
   
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
   
    const range = sel.getRangeAt(0);

    if (!range.collapsed) {
      try {
        const span = document.createElement("span");
        span.style.fontSize = appliedSize;
       
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
       
        range.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(range);
       
        savedRangeRef.current = range.cloneRange();
       
        emitChange();
        checkFormatting();
      } catch (e) {
        console.error("Error applying font size:", e);
      }
    } else {
      try {
        const span = document.createElement("span");
        span.style.fontSize = appliedSize;
        span.innerHTML = "&#8203;";
        span.setAttribute("data-placeholder", "true");
       
        range.insertNode(span);
        range.setStart(span.firstChild!, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
       
        savedRangeRef.current = range.cloneRange();
      } catch (e) {
        console.error("Error creating placeholder:", e);
      }
    }
  };

  const applyColorToSelection = (color: string) => {
    if (readMode) return;
   
    const editor = editorRef.current;
    if (!editor) return;
   
    restoreSelection();
   
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
   
    const range = sel.getRangeAt(0);

    if (!range.collapsed) {
      try {
        const span = document.createElement("span");
        span.style.color = color;
       
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
       
        range.setStartAfter(span);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
       
        savedRangeRef.current = range.cloneRange();
       
        emitChange();
        checkFormatting();
      } catch (e) {
        console.error("Error applying color:", e);
      }
    } else {
      try {
        const span = document.createElement("span");
        span.style.color = color;
        span.innerHTML = "&#8203;";
        span.setAttribute("data-placeholder", "true");
       
        range.insertNode(span);
        range.setStart(span.firstChild!, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
       
        savedRangeRef.current = range.cloneRange();
      } catch (e) {
        console.error("Error creating placeholder:", e);
      }
    }
  };

  const handleColorConfirm = () => {
    setTextColor(pendingColor);
    applyColorToSelection(pendingColor);
    setShowColorPicker(false);
  };

  const handleColorCancel = () => {
    setPendingColor(textColor);
    setShowColorPicker(false);
  };

  const handleEditorInput = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const placeholders = editor.querySelectorAll('[data-placeholder="true"]');
    placeholders.forEach(placeholder => {
      if (placeholder.textContent && placeholder.textContent.length > 1) {
        placeholder.removeAttribute("data-placeholder");
      }
    });

    saveSelection();
    emitChange();
    checkFormatting();
  };

  const handleSelectionChange = () => {
    saveSelection();
    checkFormatting();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showColorPicker && !target.closest('.color-picker-container')) {
        handleColorCancel();
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker, textColor]);

  return (
    <div style={{
      borderRadius: '8px',
      border: '1px solid #ddd',
      backgroundColor: '#ffffff',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    }}>
      {isShowToolbarSection && <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#e6f2ff',
        padding: '8px',
        borderRadius: '4px',
        gap: '8px',
        flexWrap: 'nowrap',
        overflow: 'visible',
        transition: 'height 0.3s ease',
        height: isExpandToolbar ? '48px' : '32px',
        position: 'relative',
        zIndex: 10,
      }}>
        {isExpandToolbar ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            visibility: isExpandToolbar ? 'visible' : 'hidden',
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBoldClick}
                style={{
                  height: '32px',
                  width: '32px',
                  minWidth: '32px',
                  padding: 0,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: isBold ? '#1976d2' : '#fff',
                  color: isBold ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.1s ease',
                }}
                title="Bold"
              >
                B
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleItalicClick}
                style={{
                  height: '32px',
                  width: '32px',
                  minWidth: '32px',
                  padding: 0,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: isItalic ? '#1976d2' : '#fff',
                  color: isItalic ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontStyle: 'italic',
                  transition: 'all 0.1s ease',
                }}
                title="Italic"
              >
                I
              </button>
            </div>

            {isShowFontSizeSection &&
              <>
                <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

                <select
                  value={fontSize}
                  onFocus={(e) => {
                    e.preventDefault();
                    saveSelection();
                  }}
                  onChange={handleFontSizeChange}
                  style={{
                    height: '32px',
                    minWidth: '84px',
                    padding: '4px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#000',
                    cursor: 'pointer',
                  }}
                >
                  {availableFontSizes.map((s) => (
                    <option key={s} value={s} style={{ color: '#000', fontSize: s === "Size" ? "14px" : `${s}px` }}>
                      {s === "Size" ? "Size" : `${s} px`}
                    </option>
                  ))}
                </select>
              </>
            }

            {isShowColorPickerSection &&
              <>
                <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

                <div style={{ position: 'relative' }} className="color-picker-container">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      saveSelection();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setPendingColor(textColor);
                      setShowColorPicker(!showColorPicker);
                    }}
                    style={{
                      height: '32px',
                      width: '32px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                    title="Text Color"
                  >
                    <span style={{ fontSize: '18px', color: textColor, fontWeight: 'bold' }}>A</span>
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '3px',
                      backgroundColor: textColor,
                    }} />
                  </button>

                  {showColorPicker && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        left: '0',
                        zIndex: 9999,
                        backgroundColor: '#fff',
                        border: '2px solid #1976d2',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        width: '360px',
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#000' }}>
                          Choose Color
                        </div>
                        <button
                          onClick={handleColorCancel}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '0 4px',
                            lineHeight: 1,
                          }}
                          title="Close"
                        >
                          ×
                        </button>
                      </div>
                   
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gap: '6px',
                        marginBottom: '16px',
                      }}>
                        {colorPalette.map((color) => (
                          <div
                            key={color}
                            onClick={() => setPendingColor(color)}
                            style={{
                              width: '26px',
                              height: '26px',
                              backgroundColor: color,
                              border: pendingColor.toUpperCase() === color.toUpperCase()
                                ? '3px solid #1976d2'
                                : '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxSizing: 'border-box',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.15)';
                              e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                        ))}
                      </div>
                   
                      <div style={{
                        borderTop: '1px solid #e0e0e0',
                        paddingTop: '16px',
                      }}>
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          fontWeight: '600',
                          marginBottom: '10px'
                        }}>
                          Custom Color
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '12px',
                        }}>
                          <div style={{
                            position: 'relative',
                            width: '50px',
                            height: '40px',
                          }}>
                            <input
                              type="color"
                              value={pendingColor}
                              onChange={(e) => setPendingColor(e.target.value.toUpperCase())}
                              style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                border: '2px solid #ccc',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            />
                          </div>
                          <input
                            type="text"
                            value={pendingColor}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              if (/^#[0-9A-F]{0,6}$/.test(val)) {
                                setPendingColor(val);
                              }
                            }}
                            placeholder="#000000"
                            style={{
                              flex: 1,
                              height: '40px',
                              border: '2px solid #ccc',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '14px',
                              fontFamily: 'monospace',
                              fontWeight: '500',
                            }}
                          />
                        </div>
                       
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: 'flex-end',
                        }}>
                          <button
                            onClick={handleColorCancel}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              backgroundColor: '#fff',
                              color: '#666',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fff';
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleColorConfirm}
                            style={{
                              padding: '8px 16px',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: '#1976d2',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#1565c0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#1976d2';
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            }
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        <button
          onClick={() => setIsExpandToolbar(!isExpandToolbar)}
          style={{
            height: '24px',
            width: '24px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: "#1e1e1e"
          }}
          title={isExpandToolbar ? "Collapse toolbar" : "Expand toolbar"}
        >
          {isExpandToolbar ? '▲' : '▼'}
        </button>
      </div>}

      <div
        ref={editorRef}
        contentEditable={!readMode}
        suppressContentEditableWarning
        onInput={handleEditorInput}
        onKeyUp={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        onClick={handleSelectionChange}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: 'auto',
          padding: '16px',
          fontSize: defaultFontSize,
          lineHeight: 1.6,
          height: `calc(1.6rem * ${rows})`,
          resize: 'vertical',
          cursor: readMode ? 'not-allowed' : 'text',
          backgroundColor: '#ffffff',
          outline: 'none',
          color: '#000',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#1976d2';
          checkFormatting();
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#ccc';
        }}
      />
    </div>
  );
};

export default RichTextEditor;