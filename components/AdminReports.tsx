
import React from 'react';
import { useGame } from '../context/GameContext';
import Card from './ui/Card';
import { AlertTriangle } from 'lucide-react';

const AdminReports = () => {
  const { reports, themeMode } = useGame();

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className={`text-4xl font-display font-bold ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}>REPORTS</h2>
        <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2">Admin Dashboard</p>
      </div>

      <Card noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className={`text-xs uppercase text-zinc-500 border-b ${themeMode === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                        <th className="p-4 font-normal tracking-widest first:pl-6">Time</th>
                        <th className="p-4 font-normal tracking-widest">Reporter</th>
                        <th className="p-4 font-normal tracking-widest">Reported</th>
                        <th className="p-4 font-normal tracking-widest last:pr-6">Reason</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${themeMode === 'dark' ? 'divide-white/5' : 'divide-black/5'}`}>
                    {reports.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-zinc-500 italic">No reports submitted.</td>
                        </tr>
                    ) : (
                        reports.map((report) => (
                            <tr key={report.id} className={`${themeMode === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                                <td className="p-4 text-xs text-zinc-500 font-mono first:pl-6">
                                    {new Date(report.timestamp).toLocaleString()}
                                </td>
                                <td className={`p-4 font-medium ${themeMode === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>{report.reporter}</td>
                                <td className="p-4 text-rose-500 font-bold">{report.reportedUser}</td>
                                <td className="p-4 last:pr-6">
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-3 h-3 text-amber-500 mr-2" />
                                        <span className={themeMode === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>{report.reason}</span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
};

export default AdminReports;
