import React from 'react';
import { TerminalSensorReading } from '../data/hotelLoyaltyData';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface SensorStreamPanelProps {
  sensors: TerminalSensorReading[];
  isStreaming: boolean;
  onToggleStream: () => void;
  onTriggerArrivalWave: () => void;
  selectedTerminalId: string | 'ALL';
  onSelectTerminal: (id: string | 'ALL') => void;
}

export const SensorStreamPanel: React.FC<SensorStreamPanelProps> = ({
  sensors,
  isStreaming,
  onToggleStream,
  onTriggerArrivalWave,
  selectedTerminalId,
  onSelectTerminal
}) => {
  return (
    <section className="bg-white border border-slate-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Front Desk IoT Sensor Array</span>
            <span aria-hidden="true">·</span>
            <span>5 Active Check-In Pods</span>
            <span aria-hidden="true">·</span>
            <span>
              Stream Status: {isStreaming ? 'Live Polling (2.5s interval)' : 'Paused for Inspection'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Real-Time Terminal Sensor Telemetry & Queue Friction
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={onToggleStream}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Pause Telemetry' : 'Resume Telemetry'}</span>
          </button>

          <button
            type="button"
            onClick={onTriggerArrivalWave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate Airport Shuttle Arrival</span>
          </button>
        </div>
      </div>

      {/* Terminal Selector Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 py-3.5 border-b border-slate-100 text-xs no-print">
        <span className="text-slate-500 font-medium mr-1">Filter Station Pod:</span>
        <button
          type="button"
          onClick={() => onSelectTerminal('ALL')}
          className={`px-2.5 py-1 rounded border font-medium transition-colors whitespace-nowrap ${
            selectedTerminalId === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          All 5 Front Desk Pods
        </button>
        {sensors.map((pod) => (
          <button
            key={pod.terminalId}
            type="button"
            onClick={() => onSelectTerminal(pod.terminalId)}
            className={`px-2.5 py-1 rounded border font-medium transition-colors whitespace-nowrap font-mono-tabular ${
              selectedTerminalId === pod.terminalId
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {pod.terminalId}
          </button>
        ))}
      </div>

      {/* High-Density Hardware Sensor Telemetry Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
              <th className="py-2.5 pr-4">Terminal & Zone</th>
              <th className="py-2.5 px-3">Assigned Staff</th>
              <th className="py-2.5 px-3 text-right">Lidar Queue Depth</th>
              <th className="py-2.5 px-3 text-right">Est. Queue Wait</th>
              <th className="py-2.5 px-3 text-right">NFC Keycard Tap Rate</th>
              <th className="py-2.5 px-3 text-right">Kiosk Dwell Time</th>
              <th className="py-2.5 px-3 text-right">Acoustic Level</th>
              <th className="py-2.5 px-3 text-right">Pod Conversion</th>
              <th className="py-2.5 pl-3 text-right">Operational State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {sensors
              .filter((s) => selectedTerminalId === 'ALL' || s.terminalId === selectedTerminalId)
              .map((sensor) => {
                const podConversionPct =
                  sensor.enrollmentPromptedCount > 0
                    ? ((sensor.convertedCount / sensor.enrollmentPromptedCount) * 100).toFixed(1)
                    : '0.0';

                const isHighWait = sensor.avgWaitSeconds >= 160;
                const isElevatedWait = sensor.avgWaitSeconds >= 120 && sensor.avgWaitSeconds < 160;

                return (
                  <tr
                    key={sensor.terminalId}
                    className="hover:bg-slate-50/90 transition-colors h-11"
                  >
                    <td className="py-2.5 pr-4">
                      <div className="font-semibold text-slate-900">{sensor.terminalName}</div>
                      <div className="text-[11px] text-slate-500 font-mono-tabular">
                        {sensor.terminalId} · {sensor.zone} · {sensor.lastUpdatedIso}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {sensor.staffAssigned}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-900">
                      {sensor.queueDepthGuests} {sensor.queueDepthGuests === 1 ? 'guest' : 'guests'}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono-tabular font-semibold ${
                        isHighWait
                          ? 'text-red-700'
                          : isElevatedWait
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {sensor.avgWaitSeconds}s
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-800">
                      {sensor.nfcTapReadRatePct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-800">
                      {sensor.kioskDwellSeconds}s
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular text-slate-600">
                      {sensor.ambientDecibels} dB
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold text-slate-900">
                      {podConversionPct}% ({sensor.convertedCount}/{sensor.enrollmentPromptedCount})
                    </td>
                    <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          sensor.status === 'High Queue'
                            ? 'text-red-700'
                            : sensor.status === 'Calibration Needed'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {sensor.status === 'High Queue'
                          ? 'High Queue Alert'
                          : sensor.status === 'Calibration Needed'
                          ? 'Verify Reader'
                          : 'Nominal Operation'}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
