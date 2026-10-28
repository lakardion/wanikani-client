import ApiKeyBar from "../components/ApiKeyBar";
import MethodPicker from "../components/MethodPicker";
import ParametersPanel from "../components/ParametersPanel";
import PayloadPanel from "../components/PayloadPanel";
import ResultPanel from "../components/ResultPanel";

export default function App() {
  return (
    <div class="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <ApiKeyBar />
      <div class="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <MethodPicker />
      </div>
      <main class="grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)_minmax(0,1fr)]">
        <ParametersPanel />
        <PayloadPanel />
        <ResultPanel />
      </main>
    </div>
  );
}
