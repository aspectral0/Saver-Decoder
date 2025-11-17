import JsonEditor from '../JsonEditor';

export default function JsonEditorExample() {
  const sampleData = {
    atoms: "154804.59650749689025",
    prestigePoints: "0",
    generators: [
      { id: "gen1", count: 29 },
      { id: "gen2", count: 0 }
    ]
  };

  return (
    <div className="p-6 max-w-2xl">
      <JsonEditor 
        title="Edit Save Data" 
        initialData={sampleData}
        onSave={(data) => console.log('Saved:', data)}
      />
    </div>
  );
}
