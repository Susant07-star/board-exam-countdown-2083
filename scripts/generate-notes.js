const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../notes');
const outputFile = path.join(__dirname, '../notes.json');

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
    const files = fs.readdirSync(subjectPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && !dirent.name.startsWith('.'))
      .map(dirent => {
        const ext = path.extname(dirent.name);
        const name = path.basename(dirent.name, ext);
        return {
          name: name,
          filename: dirent.name,
          path: `notes/${subject}/${dirent.name}`,
          size: fs.statSync(path.join(subjectPath, dirent.name)).size
        };
      });

    result.subjects.push({
      name: subject,
      files: files
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`Successfully generated notes.json with ${result.subjects.length} subjects.`);
}

generateNotesIndex();
