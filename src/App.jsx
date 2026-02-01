import { useState } from "react";
import Dashboard from "./Dashboard";
import ProviderDetails from "./ProviderDetails";


export default function App() {
  const [view, setView] = useState(null); // ALL | provider | null

  const [providersData, setProvidersData] = useState({
    UHC: [],
    Aetna: [],
    Humana: [],
    Ambetter: [],
    UMR: [],
  });

  return view ? (
    <ProviderDetails
      view={view}
      providersData={providersData}
      setProvidersData={setProvidersData}
      goBack={() => setView(null)}
    />
  ) : (
    <Dashboard
      providersData={providersData}
      setProvidersData={setProvidersData}
      openView={setView}
    />
  );
}
