import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Dropdown Component - Menu selector with animation
 */
const Dropdown = React.forwardRef(({
  items = [],
  onSelect,
  placeholder = 'Select an option',
  value,
  label,
  icon: Icon,
  multiple = false,
  searchable = false,
  className = '',
  ...props
}, ref) => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState(multiple ? value || [] : null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = search
    ? items.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const handleSelect = (item) => {
    if (multiple) {
      const newSelected = selectedItems.includes(item.value)
        ? selectedItems.filter(v => v !== item.value)
        : [...selectedItems, item.value];
      setSelectedItems(newSelected);
      onSelect?.(newSelected);
    } else {
      setSelectedItems(item.value);
      onSelect?.(item.value);
      setIsOpen(false);
    }
  };

  const displayValue = selectedItems
    ? multiple
      ? selectedItems.length > 0
        ? `${selectedItems.length} selected`
        : placeholder
      : items.find(item => item.value === selectedItems)?.label || placeholder
    : placeholder;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} {...props}>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      
      <motion.button
        className="w-full px-4 py-2.5 border-2 border-slate-600 bg-slate-900/50 rounded-lg text-white text-left flex items-center justify-between gap-2 hover:border-slate-500 transition-all"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}
      >
        <div className="flex items-center gap-2 flex-grow truncate">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <span className="truncate">{displayValue}</span>
        </div>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 text-slate-400 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-lg shadow-2xl z-50"
          >
            {searchable && (
              <div className="p-2 border-b border-white/5">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            )}
            
            <ul className="max-h-64 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <li className="px-4 py-3 text-center text-slate-400 text-sm">
                  No options found
                </li>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = multiple
                    ? selectedItems.includes(item.value)
                    : selectedItems === item.value;

                  return (
                    <motion.li
                      key={item.value}
                      whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                    >
                      <button
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? 'bg-violet-500/20 text-violet-300 font-medium'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        onClick={() => handleSelect(item)}
                      >
                        <div className="flex items-center gap-2">
                          {multiple && (
                            <div
                              className={`w-4 h-4 border rounded transition-all ${
                                isSelected
                                  ? 'bg-violet-500 border-violet-500'
                                  : 'border-slate-500'
                              }`}
                            />
                          )}
                          {item.label}
                        </div>
                      </button>
                    </motion.li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Dropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  onSelect: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  label: PropTypes.string,
  icon: PropTypes.elementType,
  multiple: PropTypes.bool,
  searchable: PropTypes.bool,
  className: PropTypes.string,
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
