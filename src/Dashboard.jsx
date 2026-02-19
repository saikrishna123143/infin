import { useState } from "react";

export default function Dashboard({ providersData, setProvidersData, openView }) {
  const [excelText, setExcelText] = useState("");

  // ✅ User dynamic column names
  const [caseIdColumnName, setCaseIdColumnName] = useState("Case ID");
  const [insuranceColumnName, setInsuranceColumnName] = useState("Insurance");

  // ✅ Normalize insurance values (Provider Group)
  function normalizeInsurance(value) {
    const v = (value || "").trim().toLowerCase();

    if (v === "uhc" || v.includes("united")) return "UHC";
    if (v === "humana") return "Humana";
    if (v === "ambetter") return "Ambetter";
    if (v === "medicare") return "Medicare";
    if (v === "cigna") return "Cigna";

    // ✅ Keep American Specialty Health separate
    if (v.includes("american specialty health")) return "American Specialty Health";

    return "Other";
  }

  // ✅ Portal mapping
  function getPortalName(provider) {
    if (provider === "Humana") return "Availity";
    if (provider === "Ambetter") return "Ambetter";
    if (provider === "UHC") return "UHC";
    if (provider === "Medicare") return "Availity";

    // ✅ Cigna portal
    if (provider === "Cigna") return "Cigna";

    // ✅ American Specialty Health uses Cigna portal
    if (provider === "American Specialty Health") return "Cigna";

    return "---";
  }

  // ✅ Generate note content
  function generateNote(provider) {
    // Medicare special format
    if (provider === "Medicare") {
      return `Checked on Availity web portal found the benefits which are as follows,
Insurance primary: Yes,
Tax id: ,
Network Status: In-Network, 
Effective Date:  - 12/31/2026 (Calendar Year), 
Plan Type: Medicare Part B, 
Co-Insurance: 20%, 
Individual DED: $283, Met: $283, REM: $0 , 
Therapy Cap Amount: $2480, USED: $0, Rem:$2480,
Visit limit: Based on medical necessity, 
Home Health Care: No,
Hospice: No, 
Skilled Nursing Care: No, 
Referral required: No, 
Auth Required: No,
Tele Health: NA`;
    }

    // UHC / Humana / Ambetter / Cigna / American Specialty Health
    if (
      provider === "Humana" ||
      provider === "Ambetter" ||
      provider === "UHC" ||
      provider === "Cigna" ||
      provider === "American Specialty Health"
    ) {
      return `TIN#
Checked on ${getPortalName(provider)} portal found the benefits which are as follows,
Network status: In-network
This is Primary Insurance
- Effective Date:
- No term date (Calendar year)
- Plan type:
- Co-pay: $
- Co-ins: %
- Individual Deductible: $ Met: $ Remaining: $
- Individual OOP: $ Met: $ Remaining: $
- Family Deductible: $ Met: $ Remaining: $
- Family OOP: $ Met: $ Remaining: $
- Visits: Met: Remaining:
- Auth required:
- Referral required:
- Telehealth: Yes( )
- HSA:
- HRA:
- call refer:`;
    }

    // Other
    return `TIN#
Checked on --- portal found the benefits which are as follows,
Network status: In-network
This is Primary Insurance
- Effective Date:
- No term date (Calendar year)
- Plan type:
- Co-pay: $
- Co-ins: %
- Individual Deductible: $ Met: $ Remaining: $
- Individual OOP: $ Met: $ Remaining: $
- Family Deductible: $ Met: $ Remaining: $
- Family OOP: $ Met: $ Remaining: $
- Visits: Met: Remaining:
- Auth required:
- Referral required:
- Telehealth: Yes( )
- HSA:
- HRA:
- call refer:`;
  }

  // ✅ Find column index from header row
  function findColumnIndex(headers, columnName) {
    const wanted = (columnName || "").trim().toLowerCase();
    return headers.findIndex(h => (h || "").trim().toLowerCase() === wanted);
  }

  // ✅ Parse pasted table by column names (dynamic)
  function parseExcelText(text) {
    const rawLines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (rawLines.length < 2) return [];

    // First row = headers
    const headers = rawLines[0].split("\t").map(x => x.trim());

    const caseIdIndex = findColumnIndex(headers, caseIdColumnName);
    const insuranceIndex = findColumnIndex(headers, insuranceColumnName);

    if (caseIdIndex === -1 || insuranceIndex === -1) {
      alert(
        `Column not found!\n\nAvailable columns:\n${headers.join(
          ", "
        )}\n\nYou typed:\nCase ID column = ${caseIdColumnName}\nInsurance column = ${insuranceColumnName}`
      );
      return [];
    }

    // Remaining rows = data
    const dataLines = rawLines.slice(1);

    return dataLines
      .map(line => {
        const parts = line.split("\t").map(x => x.trim());

        const caseId = parts[caseIdIndex] || "";
        const insurance = parts[insuranceIndex] || "";

        return { caseId, insurance };
      })
      .filter(r => r.caseId && r.insurance);
  }

  // ✅ Generate notes from pasted table
  function handleGenerateFromExcel() {
    const rows = parseExcelText(excelText);
    if (rows.length === 0) return;

    setProvidersData(prev => {
      const updated = { ...prev };

      rows.forEach(row => {
        const provider = normalizeInsurance(row.insurance);

        const note = {
          caseId: row.caseId,
          insurance: provider, // keep same provider name
          portal: getPortalName(provider),
          content: generateNote(provider),
          status: "IN_PROGRESS"
        };

        updated[provider] = [...(updated[provider] || []), note];
      });

      return updated;
    });

    setExcelText("");
  }

  // ✅ Download all notes
  function downloadAllNotes() {
    let text = "";

    const providersOrder = [
      "UHC",
      "Humana",
      "Ambetter",
      "Cigna",
      "American Specialty Health",
      "Medicare",
      "Other"
    ];

    providersOrder.forEach(provider => {
      const notes = providersData[provider] || [];
      if (notes.length === 0) return;

      text += `============================================================\n`;
      text += `PROVIDER: ${provider}\n`;
      text += `============================================================\n\n`;

      notes.forEach((note, index) => {
        text += `NOTE #${index + 1}\n`;
        text += `Case ID   : ${note.caseId}\n`;
        text += `Insurance : ${note.insurance || provider}\n`;
        text += `Portal    : ${note.portal || getPortalName(provider)}\n`;
        text += `Status    : ${note.status}\n`;
        text += `------------------------------------------------------------\n`;
        text += `${note.content}\n`;
        text += `------------------------------------------------------------\n\n\n\n\n\n`;
      });

      text += `\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "insurance-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Insurance Dashboard
        </h1>

        <button
          onClick={downloadAllNotes}
          className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white"
        >
          ⬇ Download All Notes
        </button>
      </div>

      {/* INPUT */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Paste Data (Dynamic Column Names)
        </h2>

        {/* Column Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-1">Case ID Column Name</p>
            <input
              value={caseIdColumnName}
              onChange={e => setCaseIdColumnName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Example: Case ID"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Insurance Column Name</p>
            <input
              value={insuranceColumnName}
              onChange={e => setInsuranceColumnName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Example: Payor"
            />
          </div>
        </div>

        <textarea
          value={excelText}
          onChange={e => setExcelText(e.target.value)}
          placeholder={`Case ID\t...\tPayor\nupf2-1831898\t...\tAmbetter\nupf2-1837907\t...\tMedicare\nupf1-1493253\t...\tAmerican Specialty Health`}
          className="w-full border p-3 rounded h-52 font-mono text-sm"
        />

        <button
          onClick={handleGenerateFromExcel}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
        >
          Generate Notes
        </button>
      </div>

      {/* PROVIDER FILTERS */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          View Notes By Provider
        </h2>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => openView("ALL")}
            className="px-4 py-2 bg-slate-900 text-white rounded"
          >
            All Providers
          </button>

          {[
            "UHC",
            "Humana",
            "Ambetter",
            "Cigna",
            "American Specialty Health",
            "Medicare",
            "Other"
          ].map(p => (
            <button
              key={p}
              onClick={() => openView(p)}
              className="px-4 py-2 border rounded"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
