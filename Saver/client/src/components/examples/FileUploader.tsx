import FileUploader from '../FileUploader';

export default function FileUploaderExample() {
  return (
    <div className="p-6 max-w-2xl">
      <FileUploader
        label="Upload Save File"
        onFileUpload={(content, fileName) => console.log('File uploaded:', fileName)}
        uploadedFileName="atom_idle_save_2025-10-13.txt"
        onClear={() => console.log('File cleared')}
      />
    </div>
  );
}
