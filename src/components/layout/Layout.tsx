import React from 'react';
import ProjectPanel from './panels/ProjectPanel';
import TablePanel from './panels/TablePanel';
import FieldPanel from './panels/FieldPanel';

const Layout: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProjectPanel />
      <TablePanel />
      <FieldPanel />
    </div>
  );
};

export default Layout;