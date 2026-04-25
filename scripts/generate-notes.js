const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../notes');
const outputFile = path.join(__dirname, '../notes.json');

function getAllFilesRecursive(dirPath, baseSubjectPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (file.isDirectory()) {
      if (!file.name.startsWith('.')) {
        arrayOfFiles = getAllFilesRecursive(path.join(dirPath, file.name), baseSubjectPath, arrayOfFiles);
      }
    } else {
      if (!file.name.startsWith('.')) {
        const fullPath = path.join(dirPath, file.name);
        const relativePath = path.relative(baseSubjectPath, fullPath);
        const dirname = path.dirname(relativePath);
        const subfolder = dirname === '.' ? null : dirname.replace(/\\/g, '/');
        
        const ext = path.extname(file.name);
        const name = path.basename(file.name, ext);
        // Ensure web paths use forward slashes
        const webPath = `notes/${path.basename(baseSubjectPath)}/${relativePath.replace(/\\/g, '/')}`;
        
        arrayOfFiles.push({
          name: name,
          filename: file.name,
          path: webPath,
          size: fs.statSync(fullPath).size,
          subfolder: subfolder
        });
      }
    }
  });

  return arrayOfFiles;
}

function generateNotesIndex() {
  const result = {
    subjects: []
  };

  if (!fs.existsSync(notesDir)) {
    console.warn("notes directory does not exist. Creating it.");
    fs.mkdirSync(notesDir, { recursive: true });
    // create default subjects
    const defaultSubjects = ['English', 'Nepali', 'Maths', 'Computer', 'Physics', 'Chemistry'];
    for (const sub of defaultSubjects) {
      fs.mkdirSync(path.join(notesDir, sub), { recursive: true });
    }
  }

  const subjects = fs.readdirSync(notesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subject of subjects) {
    const subjectPath = path.join(notesDir, subject);
    const files = getAllFilesRecursive(subjectPath, subjectPath, []);

    result.subjects.push({
      name: subject,
      files: files
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`Successfully generated notes.json with ${result.subjects.length} subjects.`);
}

generateNotesIndex();
