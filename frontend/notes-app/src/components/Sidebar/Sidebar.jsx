// components/Sidebar/Sidebar.jsx
import React from "react";
import SidebarItem from "./SidebarItem";

const Sidebar = ({ pages }) => {
  const subPagesMap = {};

  // Group pages by parentId
  pages.forEach((page) => {
    const parentId = page.parentId || "root";
    if (!subPagesMap[parentId]) subPagesMap[parentId] = [];
    subPagesMap[parentId].push(page);
  });

  const topLevelPages = subPagesMap["root"] || [];

  return (
    <aside className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {topLevelPages.map((page) => (
        <SidebarItem key={page._id} page={page} subPagesMap={subPagesMap} />
      ))}
    </aside>
  );
};

export default Sidebar;
