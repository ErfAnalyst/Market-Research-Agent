import React from 'react';
import { PersonnelRow } from '../types';

interface PersonnelTableProps {
  data: PersonnelRow[];
  onUpdate: (id: string, field: keyof PersonnelRow, value: string) => void;
  onLock: (id: string, field: keyof PersonnelRow) => void;
}

const PersonnelTable: React.FC<PersonnelTableProps> = ({ data, onUpdate, onLock }) => {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 mt-8">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-slate-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">DSO Name</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider w-1/3">Implant Specialist Names</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider w-1/3">General Dentist Names</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Sum (D+S)</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Visual Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className={row.id === 'internal' ? 'bg-blue-50' : 'hover:bg-gray-50'}>
              <td className="px-4 py-2 font-medium text-gray-900">{row.name}</td>
              {([
                'specialistNames',
                'generalDentistNames',
                'formulaSum',
                'source'
              ] as const).map((field) => (
                <td key={field} className="px-4 py-2 relative group align-top">
                  <textarea
                    value={String(row[field])}
                    onChange={(e) => onUpdate(row.id, field, e.target.value)}
                    onBlur={() => onLock(row.id, field)}
                    rows={Math.max(2, String(row[field]).split(',').length)}
                    className={`w-full bg-transparent border border-transparent focus:border-blue-500 focus:bg-white rounded p-1 resize-none ${
                      row.isLocked[field] ? 'text-red-600 font-semibold' : 'text-gray-700'
                    }`}
                  />
                  {row.isLocked[field] && (
                    <span className="absolute top-1 right-1 text-xs text-red-500">
                      HLRL
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonnelTable;