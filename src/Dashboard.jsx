import { useState } from "react";

export default function Dashboard({ providersData, setProvidersData, openView }) {
  const [caseId, setCaseId] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [memberId, setMemberId] = useState("");
  const [provider, setProvider] = useState("");
  const [taxId, setTaxId] = useState("");

  // Portal mapping
  function getPortalName(provider) {
    if (provider === "Aetna" || provider === "Humana") return "Availity";
    return provider;
  }

  // Generate note content
  function generateNote(provider, taxId) {
    const sourceLine =
      provider === "Aetna"
        ? "-Below info called to Aetna @18886323862 spoke with ,Rep stated benefits which are follows,"
        : `checked on ${getPortalName(provider)} portal found the benefits which are as follows`;

    return `TIN# : ${taxId}
Network status: In-network
This is Primary Insurance
${sourceLine}
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

  function handleSubmit() {
    if (!caseId || !name || !dob || !memberId || !provider || !taxId) return;

    const note = {
      caseId,
      name,
      dob,
      memberId,
      taxId,
      content: generateNote(provider, taxId),
      status: "IN_PROGRESS",
    };

    setProvidersData(prev => ({
      ...prev,
      [provider]: [...prev[provider], note],
    }));

    // Reset form
    setCaseId("");
    setName("");
    setDob("");
    setMemberId("");
    setProvider("");
    setTaxId("");
  }

  // Download all notes
  function downloadAllNotes() {
    let text = "";

    Object.keys(providersData).forEach(provider => {
      text += `==============================\n`;
      text += `PROVIDER: ${provider}\n`;
      text += `==============================\n\n`;

      providersData[provider].forEach((note, index) => {
        text += `Note ${index + 1}\n`;
        text += `Case ID: ${note.caseId}\n`;
        text += `Name: ${note.name}\n`;
        text += `DOB: ${note.dob}\n`;
        text += `Member ID: ${note.memberId}\n`;
        text += `Tax ID: ${note.taxId}\n`;
        text += `Status: ${note.status}\n\n`;
        text += `${note.content}\n\n`;
        text += `------------------------------\n\n`;
      });
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

      {/* CREATE NOTE */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Create Verification Note
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Case ID" value={caseId} onChange={e => setCaseId(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Patient Name" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" />
          <input placeholder="DOB" value={dob} onChange={e => setDob(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Member ID" value={memberId} onChange={e => setMemberId(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Tax ID (TIN)" value={taxId} onChange={e => setTaxId(e.target.value)} className="border p-2 rounded" />

          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Provider</option>
            <option value="UHC">UHC</option>
            <option value="Aetna">Aetna</option>
            <option value="Humana">Humana</option>
            <option value="Ambetter">Ambetter</option>
            <option value="UMR">UMR</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
        >
          Create Note
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

          {Object.keys(providersData).map(p => (
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
