import React, { useState } from "react";

// 1) Simple CSV parsing
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");

  const data = lines.slice(1).map(line => {
    const values = line.split(",");
    let rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header.trim()] = values[index]?.trim() || "";
    });
    return rowObj;
  });
  return data;
}

// 2) Naive carbon calculation
function measureCarbon(row) {
  const impressions = parseInt(row.impressions, 10) || 0;
  const fileSize = parseInt(row.file_size_kb, 10) || 0;
  // Arbitrary placeholder formula
  const co2 = impressions * fileSize * 0.0001; 
  return co2; 
}

// 3) Simple “AI” recommendation
function aiRecommendation(co2_kg, row) {
  // Example logic – if co2 is high, suggest smaller creative or fewer impressions
  if (co2_kg > 100) {
    return "High CO₂. Consider smaller creative or reducing impressions.";
  } else if (co2_kg > 50) {
    return "Moderate CO₂. Maybe optimize hosting or visuals.";
  } else {
    return "Low CO₂. Good job!";
  }
}

export default function App() {
  const [results, setResults] = useState([]);

  // Called when user uploads a CSV
  const handleFileUpload = async (event) => {
    if (!event.target.files?.[0]) return;
    const file = event.target.files[0];
    const text = await file.text(); // read the CSV file as text

    // Parse CSV into objects
    const parsedRows = parseCSV(text);

    // For each row, measure co2 & generate AI recommendation
    const finalRows = parsedRows.map((row) => {
      const co2_val = measureCarbon(row);
      const co2_kg = co2_val.toFixed(3);
      const advice = aiRecommendation(co2_val, row);
      return { ...row, co2_kg, ai_recommendation: advice };
    });

    setResults(finalRows);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, color: "#2E7D32" }}>AdVerde MVP (AI version)</h1>
      <p>Upload a CSV with headers like:</p>
      <pre>publisher, file_size_kb, geo_location, impressions</pre>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginTop: 10 }}
      />

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>Calculated CO₂ & AI Suggestions</h2>
          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {Object.keys(results[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i}>
                  {Object.keys(row).map((key) => (
                    <td key={key}>{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
