import StatsDisplay from '../StatsDisplay';

export default function StatsDisplayExample() {
  const sampleData = {
    atoms: "1.859706019337433095e+11205",
    prestigePoints: "3.624861490936696125e+4185",
    generators: [
      { id: "gen1", count: 184660 },
      { id: "gen2", count: 141537 },
      { id: "gen3", count: 0 },
      { id: "gen4", count: 98336 },
      { id: "gen5", count: 85124 }
    ],
    upgrades: [
      { id: "upg0", level: 5 },
      { id: "upg1", level: 3 },
      { id: "upg2", level: 7 }
    ]
  };

  return (
    <div className="p-6">
      <StatsDisplay data={sampleData} />
    </div>
  );
}
