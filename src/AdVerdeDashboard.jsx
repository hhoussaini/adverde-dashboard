import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Bell, Mail, Clock, UserCheck, ShieldCheck, ListChecks, FileText, Download, Calendar, Send, PlusCircle, Trash, Filter, Eye, MailCheck, RefreshCw, Users, Clock as Schedule, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { signIn, signOut, useSession } from "next-auth/react";
import { saveAs } from "file-saver";

export default function AdVerdeDashboard() {
  const { data: session } = useSession();
  const [role, setRole] = useState("user");
  const [scheduledExports, setScheduledExports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [exportStats, setExportStats] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [timeFilter, setTimeFilter] = useState("all");
  const [emailPreview, setEmailPreview] = useState("");
  const [emailSubject, setEmailSubject] = useState("Scheduled Report Notification");
  const [emailBody, setEmailBody] = useState("Your scheduled export report is ready. Please find the attached file.");
  const [testEmail, setTestEmail] = useState("");
  const [testEmailLogs, setTestEmailLogs] = useState([]);
  const [testLogsSchedule, setTestLogsSchedule] = useState("weekly");
  const [testLogsRecipients, setTestLogsRecipients] = useState("test.logs@adverde.io");

  useEffect(() => {
    if (session) {
      fetchScheduledExports();
      fetchAuditLogs();
      // Check user role here if needed.
    }
  }, [session]);

  const fetchScheduledExports = async () => {
    const response = await fetch(`/api/admin/scheduled-exports`);
    const exports = await response.json();
    setScheduledExports(exports);
    calculateExportStats(exports);
  };

  const fetchAuditLogs = async () => {
    const response = await fetch(`/api/admin/audit-logs`);
    const logs = await response.json();
    setAuditLogs(logs);
    const testEmailFiltered = logs.filter(log => log.type === "test-email");
    setTestEmailLogs(testEmailFiltered);
  };

  const calculateExportStats = (exports) => {
    const stats = { daily: 0, weekly: 0, monthly: 0 };
    exports.forEach(exp => {
      stats[exp.frequency] += 1;
    });
    setExportStats(stats);
  };

  const previewEmail = () => {
    setEmailPreview(`Subject: ${emailSubject}\n\n${emailBody}\n\n(Attachment: Scheduled Report)`);
  };

  const sendTestEmail = async () => {
    if (!testEmail) return alert("Please enter a test email address.");
    await fetch("/api/admin/send-test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        subject: emailSubject,
        body: emailBody,
        attachment: "Scheduled Report"
      })
    });
    // Log in local state (this can also be updated by re-fetching logs)
    const newLog = { timestamp: new Date().toISOString(), email: testEmail, type: "test-email", admin: session?.user?.email || "unknown"};
    setTestEmailLogs(prev => [...prev, newLog]);
    alert("Test email sent successfully!");
  };

  // Allows scheduling automatic exports of test email logs
  const scheduleTestEmailLogsExport = async () => {
    await fetch("/api/admin/schedule-test-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        frequency: testLogsSchedule,
        recipients: testLogsRecipients
      })
    });
    alert(`Scheduled test email logs export set to ${testLogsSchedule}, recipients: ${testLogsRecipients}`);
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E7D32]">AdVerde Carbon Dashboard</h1>
      <p className="text-gray-600">Measure and analyze the carbon footprint of your digital ad campaigns.</p>

      {role === "admin" && (
        <div className="mt-6 p-4 bg-[#F57C00] text-white rounded-lg">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <BarChart3 size={20} /> <span>Export & Log Summary</span>
          </h2>
          {/* Export Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white text-black p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Daily Exports</h3>
              <p className="text-2xl font-bold text-[#2E7D32]">{exportStats.daily}</p>
            </div>
            <div className="bg-white text-black p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Weekly Exports</h3>
              <p className="text-2xl font-bold text-[#2E7D32]">{exportStats.weekly}</p>
            </div>
            <div className="bg-white text-black p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold">Monthly Exports</h3>
              <p className="text-2xl font-bold text-[#2E7D32]">{exportStats.monthly}</p>
            </div>
          </div>

          {/* Email Customization */}
          <h3 className="mt-6 text-lg font-bold">Email Preview</h3>
          <div className="mt-4">
            <label>Email Subject:</label>
            <input
              type="text"
              className="border p-2 rounded w-full text-black"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <label className="mt-2">Email Body:</label>
            <textarea
              className="border p-2 rounded w-full text-black"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
            <Button onClick={previewEmail} className="mt-2 bg-gray-500 text-white">Preview Email</Button>
          </div>
          {emailPreview && (
            <div className="mt-4 p-4 bg-white text-black border rounded shadow">
              <pre>{emailPreview}</pre>
            </div>
          )}

          {/* Test Email */}
          <div className="mt-4">
            <label>Test Email:</label>
            <input
              type="email"
              className="border p-2 rounded w-full text-black"
              placeholder="Enter test email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <Button onClick={sendTestEmail} className="mt-2 bg-green-500 text-white">Send Test Email</Button>
          </div>

          {/* Test Email Logs */}
          <h3 className="mt-6 text-lg font-bold">Test Email Logs</h3>
          <ul className="list-disc list-inside mt-2 text-sm">
            {testEmailLogs.map((log, index) => (
              <li key={index}>
                {log.timestamp} - Sent to {log.email} {log.admin && (<span>by {log.admin}</span>)}
              </li>
            ))}
          </ul>

          {/* Scheduled Test Email Logs Export */}
          <h3 className="mt-6 text-lg font-bold">Schedule Test Email Logs Export</h3>
          <p className="text-sm">Automatically send test email logs on a recurring basis.</p>
          <div className="flex flex-col mt-2 space-y-2">
            <div>
              <label>Frequency: </label>
              <select
                className="border p-2 rounded text-black"
                value={testLogsSchedule}
                onChange={(e) => setTestLogsSchedule(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label>Recipients: </label>
              <input
                type="text"
                className="border p-2 rounded text-black w-full"
                value={testLogsRecipients}
                onChange={(e) => setTestLogsRecipients(e.target.value)}
              />
            </div>
            <Button
              onClick={scheduleTestEmailLogsExport}
              className="bg-blue-500 text-white flex items-center mt-2"
            >
              <Schedule size={18} className="mr-2" /> Schedule Export
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
