// components/Sidebar/SidebarItem.jsx
import React, { useState } from "react";

const SidebarItem = ({ page, subPagesMap }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = subPagesMap[page._id]?.length > 0;

  return (
    <div className="ml-2">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className="cursor-pointer font-semibold flex items-center gap-1"
      >
        {hasChildren && <span className="text-xs">{expanded ? "▼" : "▶"}</span>}
        {page.name}
      </div>

      {expanded && hasChildren && (
        <div className="ml-4">
          {subPagesMap[page._id].map((child) => (
            <SidebarItem
              key={child._id}
              page={child}
              subPagesMap={subPagesMap}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
