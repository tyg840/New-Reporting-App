import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, Construction, Paintbrush, Lightbulb, MapPin, X, ThumbsUp, Plus } from "lucide-react";
import { Issue, IssueCategory } from "../types";

// Toronto center coordinate layout constraints for pin mapping
const MIN_LAT = 43.6350;
const MAX_LAT = 43.6700;
const MIN_LNG = -79.4300;
const MAX_LNG = -79.3600;

const getPinPosition = (lat: number, lng: number) => {
  const top = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 100;
  const left = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
  return {
    top: `${Math.max(15, Math.min(85, top))}%`,
    left: `${Math.max(10, Math.min(90, left))}%`,
  };
};

interface MapProps {
  issues: Issue[];
  onVote: (id: string) => void;
  onNavigateToReport: () => void;
}

export default function MapComponent({ issues, onVote, onNavigateToReport }: MapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<IssueCategory | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Filter issues based on category and search text
  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = activeCategoryFilter ? issue.category === activeCategoryFilter : true;
    const matchesSearch = searchQuery
      ? issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  const toggleCategoryFilter = (cat: IssueCategory) => {
    if (activeCategoryFilter === cat) {
      setActiveCategoryFilter(null);
    } else {
      setActiveCategoryFilter(cat);
    }
  };

  return (
    <div id="map-container" className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex-1 overflow-hidden bg-editorial-bg">
      
      {/* Dynamic Map Canvas with Static Toronto Layout Backdrop */}
      <div 
        id="toronto-map-backdrop"
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500 ease-out brightness-105 contrast-95 grayscale"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDpLWQ3wryY_7ikMF067QDYvJc-WWSOCVag73pHAe66xV2bnGPB85Ug3X7XGaOyF5Typ9cemluQ9JRdVrpOTNBl5Bnt0EYfYJXS6HShc5uQcZkuAjPo7xS0ei2Pc3wMhj_X7zSeZeRS8OM5iQ8CKHvwidMLkD2SiYqdORmTSkT3GpIrzHcwdClTJZ4i0oV0tsTx2-3X8tlxmZK1yy1lxfzFrmbyog6X94h92XHbsojdF7YdcXzxJXhVGROy42anYt0_tNfjh0XWklk')`,
          filter: "saturate(1.05) contrast(1.02) sepia(0.08)",
        }}
        title="Toronto Civic Map Canvas"
      />

      {/* Floating Header Card containing Search / Filter Options */}
      <div id="map-floating-panel" className="absolute top-4 left-4 right-4 md:left-6 md:w-[420px] z-20 flex flex-col gap-2">
        
        {/* Sharp Input Field Container */}
        <div className="bg-editorial-bg border border-editorial-dark flex items-center px-4 py-2 select-none shadow-none">
          <Search className="text-editorial-dark/60 w-4 h-4 mr-3 shrink-0" />
          <input
            id="map-places-search" 
            type="text"
            className="flex-1 bg-transparent border-none text-editorial-dark placeholder-editorial-dark/40 outline-none text-xs uppercase tracking-wider py-1 focus:ring-0 focus:border-none focus:outline-none font-sans font-semibold"
            placeholder="Search catalogued locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-editorial-dark/65 hover:text-editorial-dark p-1 mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            id="map-filter-toggle"
            className="text-editorial-dark/70 hover:bg-editorial-dark/5 p-1.5 shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Horizontal Filter pills */}
        <div id="map-quick-filters" className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar select-none">
          <button
            id="filter-potholes"
            onClick={() => toggleCategoryFilter('potholes')}
            className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold border flex items-center gap-1.5 transition-all duration-150 shrink-0 cursor-pointer ${
              activeCategoryFilter === 'potholes'
                ? "bg-editorial-dark border-editorial-dark text-editorial-bg"
                : "bg-editorial-bg border-editorial-dark/40 text-editorial-dark/75 hover:bg-editorial-accent/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 ${activeCategoryFilter === 'potholes' ? "bg-editorial-bg" : "bg-[#ba1a1a]"}`} />
            Potholes
          </button>

          <button
            id="filter-graffiti"
            onClick={() => toggleCategoryFilter('graffiti')}
            className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold border flex items-center gap-1.5 transition-all duration-150 shrink-0 cursor-pointer ${
              activeCategoryFilter === 'graffiti'
                ? "bg-editorial-dark border-editorial-dark text-editorial-bg"
                : "bg-editorial-bg border-editorial-dark/40 text-editorial-dark/75 hover:bg-editorial-accent/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 ${activeCategoryFilter === 'graffiti' ? "bg-editorial-bg" : "bg-[#fd761a]"}`} />
            Graffiti
          </button>

          <button
            id="filter-streetlights"
            onClick={() => toggleCategoryFilter('streetlights')}
            className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold border flex items-center gap-1.5 transition-all duration-150 shrink-0 cursor-pointer ${
              activeCategoryFilter === 'streetlights'
                ? "bg-editorial-dark border-editorial-dark text-editorial-bg"
                : "bg-editorial-bg border-editorial-dark/40 text-editorial-dark/75 hover:bg-editorial-accent/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 ${activeCategoryFilter === 'streetlights' ? "bg-editorial-bg" : "bg-[#00544c]"}`} />
            Streetlights
          </button>
        </div>
      </div>

      {/* Render Dynamic Pins */}
      <div id="map-markers-layer" className="absolute inset-0 z-10 pointer-events-none">
        {filteredIssues.map((issue) => {
          const { top, left } = getPinPosition(issue.lat, issue.lng);
          const isSelected = selectedIssueId === issue.id;

          // Icon based on category
          let icon = <Construction className="w-3.5 h-3.5 text-editorial-bg" />;
          let pinColorClass = "bg-[#ba1a1a]";
          if (issue.category === "graffiti") {
            icon = <Paintbrush className="w-3.5 h-3.5 text-editorial-bg" />;
            pinColorClass = "bg-[#fd761a]";
          } else if (issue.category === "streetlights") {
            icon = <Lightbulb className="w-3.5 h-3.5 text-editorial-bg" />;
            pinColorClass = "bg-[#00544c]";
          }

          return (
            <button
              key={issue.id}
              id={`marker-pin-${issue.id}`}
              onClick={() => setSelectedIssueId(issue.id)}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full flex flex-col items-center group transition-all duration-150 ease-out cursor-pointer"
              style={{ top, left, zIndex: isSelected ? 30 : 20 }}
            >
              <motion.div
                className={`p-2 border border-editorial-dark flex items-center justify-center relative ${pinColorClass} rounded-none shadow-none`}
                whileHover={{ scale: 1.1, y: -2 }}
                animate={{ 
                  scale: isSelected ? 1.2 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {icon}
                {/* Visual locator pointing downward */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-editorial-dark rotate-45 z-[-1]" />
              </motion.div>
            </button>
          );
        })}
      </div>

      {/* Slide-Up Bottom Sheet Card for selected issue details */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            id="bottom-sheet"
            className="fixed bottom-16 md:bottom-6 left-4 right-4 md:absolute md:left-6 md:bottom-6 md:right-auto md:w-[380px] bg-white border border-editorial-dark z-40 max-h-[75vh] md:max-h-[500px] flex flex-col select-none overflow-hidden rounded-none shadow-none"
            initial={{ y: "15%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "15%", opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Grab Handle Header */}
            <div 
              id="sheet-drag-handle" 
              className="w-full flex justify-between items-center px-4 py-3 border-b border-editorial-dark bg-editorial-bg cursor-pointer"
              onClick={() => setSelectedIssueId(null)}
            >
              <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-editorial-dark/65">Civic Log Index</span>
              <X className="w-4 h-4 text-editorial-dark/60 hover:text-editorial-dark" onClick={(e) => { e.stopPropagation(); setSelectedIssueId(null); }} />
            </div>

            <div className="overflow-y-auto px-5 pb-6 pt-4 flex-1 flex flex-col gap-4">
              {/* Header section with category badge, title */}
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 border border-editorial-dark bg-editorial-accent text-editorial-dark text-[8px] uppercase tracking-widest font-bold font-sans">
                      {selectedIssue.status}
                    </span>
                    <span className="text-[9px] text-editorial-dark/50 font-mono tracking-wide font-medium">INDEX_{selectedIssue.id.toUpperCase().slice(0, 6)}</span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-editorial-dark leading-tight mt-1">{selectedIssue.title}</h2>
                  <p className="text-[11px] text-editorial-dark/60 flex items-center gap-1 mt-1 font-medium font-sans">
                    <MapPin className="w-3.5 h-3.5 text-editorial-dark/50" />
                    {selectedIssue.location}
                  </p>
                </div>
              </div>

              {/* Photo representation banner */}
              {selectedIssue.image && (
                <div id="selected-issue-image" className="w-full h-44 bg-editorial-accent border border-editorial-dark overflow-hidden relative shrink-0 rounded-none">
                  <img
                    src={selectedIssue.image}
                    alt={selectedIssue.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none grayscale contrast-105"
                  />
                  <div className="absolute bottom-2 right-2 bg-editorial-dark text-editorial-bg text-[8px] font-bold uppercase tracking-widest font-sans px-2.5 py-1 border border-editorial-dark">
                    {selectedIssue.date}
                  </div>
                  <div className="absolute top-2 left-2 bg-editorial-bg border border-editorial-dark text-[8px] font-bold text-editorial-dark uppercase tracking-widest font-sans px-2 py-0.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 ${
                      selectedIssue.category === 'potholes' ? "bg-[#ba1a1a]" : selectedIssue.category === 'graffiti' ? "bg-[#fd761a]" : "bg-[#00544c]"
                    }`} />
                    {selectedIssue.category}
                  </div>
                </div>
              )}

              {/* Description body text */}
              <div id="selected-issue-description" className="space-y-1.5 border-t border-editorial-dark/10 pt-3">
                <h3 className="text-[9px] font-sans font-bold text-editorial-dark/40 uppercase tracking-widest">General Dispatches</h3>
                <p className="text-xs text-editorial-dark/85 leading-relaxed font-sans">
                  {selectedIssue.description || "No further descriptions provided."}
                </p>
                <div className="pt-2 text-[9px] uppercase tracking-wider font-bold text-editorial-dark/50">Ward: {selectedIssue.ward}</div>
              </div>

              {/* Action Button: 'Me Too' endorsement/voting */}
              <button
                id="vote-endorse-btn"
                onClick={() => onVote(selectedIssue.id)}
                className={`w-full py-3.5 px-4 rounded-none flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${
                  selectedIssue.votedByUser
                    ? "bg-editorial-accent text-editorial-dark border-editorial-dark"
                    : "bg-editorial-dark text-editorial-bg border-editorial-dark hover:bg-editorial-dark/95"
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${selectedIssue.votedByUser ? "fill-editorial-dark" : ""}`} />
                <span>
                  {selectedIssue.votedByUser ? "Supporting Dispatch" : "Endorse Record"} ({selectedIssue.votes})
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button to Add/Report a new issue */}
      <motion.button
        id="map-floating-add-btn"
        onClick={onNavigateToReport}
        className="absolute bottom-20 md:bottom-6 right-4 bg-editorial-dark text-editorial-bg border border-editorial-dark rounded-none p-4 shadow-none hover:bg-editorial-dark/90 active:scale-95 transition-all duration-150 flex items-center justify-center z-30 group cursor-pointer"
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5 text-editorial-bg stroke-[3]" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2.5 transition-all duration-300 font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">
          File Report
        </span>
      </motion.button>
    </div>
  );
}
