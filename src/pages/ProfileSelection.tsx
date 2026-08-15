import { useState, useEffect } from "react";
import { fetchProfiles } from "@/services/dataService";

export default function ProfileSelection() {
  const [profiles, setProfiles] = useState<{ id: string; name: string; image: string }[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      const data = await fetchProfiles();
      setProfiles(data);
      setLoading(false);
    }
    loadProfiles();
  }, []);

  const handleSelect = () => {
    if (selectedProfile) {
      localStorage.setItem("selected_profile", selectedProfile);
      window.location.href = "/";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, profileId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedProfile(profileId);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="w-16 h-16 border-4 border-neutral-800 border-t-primary rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2">Who's watching?</h1>
      <p className="text-neutral-400 mb-10">Select your profile</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl w-full">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => setSelectedProfile(profile.id)}
            onKeyDown={(e) => handleKeyDown(e, profile.id)}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all focus-ring ${
              selectedProfile === profile.id ? "bg-white/10 ring-2 ring-primary" : "hover:bg-white/5"
            }`}
            aria-pressed={selectedProfile === profile.id}
          >
            <div
              className={`w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 transition-colors ${
                selectedProfile === profile.id ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="text-white font-medium">{profile.name}</span>
          </button>
        ))}
      </div>
      {selectedProfile && (
        <button
          onClick={handleSelect}
          className="mt-10 px-8 py-3 bg-primary text-white rounded-md font-bold hover:bg-accent transition-colors focus-ring"
        >
          Continue
        </button>
      )}
    </main>
  );
}
