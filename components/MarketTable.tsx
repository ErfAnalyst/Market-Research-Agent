import React from 'react';
import { CompetitorRow } from '../types';

interface MarketTableProps {
  data: CompetitorRow[];
  onUpdate: (id: string, field: keyof CompetitorRow, value: string) => void;
  onLock: (id: string, field: keyof CompetitorRow) => void;
}

const MarketTable: React.FC<MarketTableProps> = ({ data, onUpdate, onLock }) => {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">DSO / Practice</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Geo Focus</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Total Dentists</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Clinics</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">D/C Ratio</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Impl. Spec.</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Economy</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Pkg Low</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Pkg High</th>
            <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className={row.id === 'internal' ? 'bg-blue-50' : 'hover:bg-gray-50'}>
              <td className="px-4 py-2 font-medium text-gray-900">{row.name}</td>
              {([
                'geoFocus',
                'totalDentists',
                'totalClinics',
                'dentistsPerClinic',
                'implantSpecialists',
                'economyDenture',
                'econPackageLow',
                'econPackageHigh',
                'pricingSource'
              ] as const).map((field) => (
                <td key={field} className="px-4 py-2 relative group">
                  <input
                    type="text"
                    value={String(row[field])}
                    onChange={(e) => onUpdate(row.id, field, e.target.value)}
                    onBlur={() => onLock(row.id, field)}
                    className={`w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none ${
                      row.isLocked[field] ? 'text-red-600 font-semibold' : 'text-gray-700'
                    }`}
                  />
                  {row.isLocked[field] && (
                    <span className="absolute top-1 right-1 text-xs text-red-500 hidden group-hover:block">
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

export default MarketTable;