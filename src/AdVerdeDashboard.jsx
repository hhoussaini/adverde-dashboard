import { useState, useEffect } from "react";
// We removed references to "@/components/ui/button" & "@/components/ui/card"
import {
  Upload,
  Bell,
  Mail,
  Clock,
  UserCheck,
  ShieldCheck,
  ListChecks,
  FileText,
  Download,
  Calendar,
  Send,
  PlusCircle,
  Trash,
  Filter,
  Eye,
  MailCheck,
  RefreshCw,
  Users,
  Clock as Schedule,
  BarChart3
} from "lucide-react";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { saveAs } from "file-saver";

// Completely remove next-auth. 
// If you do want next-auth, you'll need a Next.js project or add it properly. 
// For a plain React (CRA) setup, let's just remove those references.

export default function AdVerdeDashboard() {
  // Force role to "admin" so the admin UI is visible
  const [role, setRole] = useState("admin");

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

  // On mount, fetch data (if your endpoints exist)
  useEffect(() => {
    fetchScheduledExports();
    fetchAuditLogs();
  }, []);

  const fetchScheduledExports = async () => {
    try {
      const response = await fetch(`/api/admin/scheduled-exports`);
      const data = await response.json();
      setScheduledExports(data);
      calculateExportStats(data);
    } catch (error) {
      console.error("Error fetching scheduled exports:", error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`/api/admin/audit-logs`);
      const logs = await response.json();
      setAuditLogs(logs);
      // Example: filter for test-email logs
      const testEmailFiltered = logs.filter((log) => log.type === "test-email");
      setTestEmailLogs(testEmailFiltered);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const calculateExportStats = (exportsData) => {
    const stats = { daily: 0, weekly: 0, monthly: 0 };
    exportsData.forEach((exp) => {
      stats[exp.frequency] += 1;
    });
    setExportStats(stats);
  };

  // For the email preview
  const previewEmail = () => {
    const preview = `Subject: ${emailSubject}\n\n${emailBody}\n\n(Attachment: Scheduled Report)`;
    setEmailPreview(preview);
  };

  // For test emails
  const sendTestEmail = async () => {
    if (!testEmail) {
      alert("Please enter a test email address.");
      return;
    }
    try {
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
      // Add local log
      const newLog = {
        timestamp: new Date().toISOString(),
        email: testEmail,
        type: "test-email",
        admin: "local-admin"
      };
      setTestEmailLogs((prev) => [...prev, newLog]);
      alert("Test email sent successfully!");
    } catch (error) {
      console.error("Error sending test email:", error);
      alert("Failed to send test email.");
    }
  };

  // Schedule auto-exports of test email logs
  const scheduleTestEmailLogsExport = async () => {
    try {
      await fetch("/api/admin/schedule-test-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frequency: testLogsSchedule,
          recipients: testLogsRecipients
        })
      });
      alert(`Scheduled test email logs export: ${testLogsSchedule}, recipients: ${testLogsRecipients}`);
    } catch (error) {
      console.error("Error scheduling logs export:", error);
      alert("Failed to schedule logs export.");
    }
  };

  if (role !== "admin") {
    return (
      <div className="p-8 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-[#2E7D32]">AdVerde Carbon Dashboard</h1>
        <p className="text-gray-600">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-[#2E7D32]">AdVerde Carbon Dashboard</h1>
      <p className="text-gray-600">Measure and analyze the carbon footprint of your digital ad campaigns.</p>

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
          <button onClick={previewEmail} className="mt-2 bg-gray-500 text-white px-3 py-2 rounded">
            Preview Email
          </button>
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
          <button
            onClick={sendTestEmail}
            className="mt-2 bg-green-500 text-white px-3 py-2 rounded"
          >
            Send Test Email
          </button>
        </div>

        {/* Test Email Logs */}
        <h3 className="mt-6 text-lg font-bold">Test Email Logs</h3>
        <ul className="list-disc list-inside mt-2 text-sm bg-white text-black p-3 rounded shadow">
          {testEmailLogs.map((log, index) => (
            <li key={index}>
              {log.timestamp} - Sent to {log.email}{" "}
              {log.admin && <span>by {log.admin}</span>}
            </li>
          ))}
        </ul>

        {/* Scheduled Test Email Logs Export */}
        <h3 className="mt-6 text-lg font-bold">Schedule Test Email Logs Export</h3>
        <p className="text-sm">Automatically send test email logs on a recurring basis.</p>
        <div className="flex flex-col mt-2 space-y-2 bg-white text-black p-3 rounded shadow">
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
          <button
            onClick={scheduleTestEmailLogsExport}
            className="bg-blue-500 text-white flex items-center justify-center px-3 py-2 rounded"
          >
            <Schedule size={18} className="mr-2" /> Schedule Export
          </button>
        </div>
      </div>
    </div>
  );
}
