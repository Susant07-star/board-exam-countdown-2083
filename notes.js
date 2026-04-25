document.addEventListener('DOMContentLoaded', async () => {
    const subjectsList = document.getElementById('subjects-list');
    const notesGrid = document.getElementById('notes-grid');
    const searchInput = document.getElementById('search-input');
    const emptyState = document.getElementById('empty-state');
    
    let notesData = { subjects: [] };
    let currentSubject = null;
    let allFiles = []; // For global search

    try {
        const response = await fetch('notes.json');
        if (!response.ok) {
            throw new Error('Failed to fetch notes.json');
        }
        notesData = await response.json();
        
        // Build allFiles array for search
        notesData.subjects.forEach(sub => {
            sub.files.forEach(f => {
                allFiles.push({ ...f, subject: sub.name });
            });
        });

        renderSubjects();
        
        // Select first subject by default if available
        if (notesData.subjects.length > 0) {
            selectSubject(notesData.subjects[0].name);
        } else {
            subjectsList.innerHTML = '<div class="loading-text">No subjects found.</div>';
        }
        
    } catch (error) {
        console.error('Error loading notes:', error);
        subjectsList.innerHTML = '<div class="loading-text" style="color: #ef4444;">Failed to load notes data.</div>';
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (query.trim() === '') {
            // If search is empty, revert to current subject
            if (currentSubject) {
                const subData = notesData.subjects.find(s => s.name === currentSubject);
                renderNotes(subData ? subData.files : []);
            }
            return;
        }
        
        // Search across all subjects
        const results = allFiles.filter(file => 
            file.name.toLowerCase().includes(query) || 
            file.subject.toLowerCase().includes(query)
        );
        
        renderNotes(results, true);
    });

    function renderSubjects() {
        subjectsList.innerHTML = '';
        notesData.subjects.forEach(subject => {
            const btn = document.createElement('button');
            btn.className = 'subject-btn';
            btn.dataset.subject = subject.name;
            btn.innerHTML = `
                <span>${subject.name}</span>
                <span class="subject-count">${subject.files.length}</span>
            `;
            
            btn.addEventListener('click', () => {
                searchInput.value = ''; // clear search when switching
                selectSubject(subject.name);
            });
            
            subjectsList.appendChild(btn);
        });
    }

    function selectSubject(subjectName) {
        currentSubject = subjectName;
        
        // Update active class on buttons
        document.querySelectorAll('.subject-btn').forEach(btn => {
            if (btn.dataset.subject === subjectName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        const subjectData = notesData.subjects.find(s => s.name === subjectName);
        if (subjectData) {
            renderNotes(subjectData.files);
        }
    }

    function renderNotes(files, isSearchResult = false) {
        notesGrid.innerHTML = '';
        
        if (files.length === 0) {
            emptyState.classList.remove('hidden');
            if (isSearchResult) {
                emptyState.querySelector('p').textContent = 'No notes found matching your search.';
            } else {
                emptyState.querySelector('p').textContent = 'No notes found in this subject yet.';
            }
            return;
        }
        
        emptyState.classList.add('hidden');
        
        files.forEach(file => {
            const sizeKB = (file.size / 1024).toFixed(1);
            let sizeDisplay = `${sizeKB} KB`;
            if (file.size > 1024 * 1024) {
                sizeDisplay = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
            }

            const card = document.createElement('div');
            card.className = 'note-card';
            
            const isPdf = file.filename.toLowerCase().endsWith('.pdf');
            const iconClass = isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file';
            
            let subjectBadge = '';
            let badges = [];
            
            if (isSearchResult && file.subject) {
                badges.push(file.subject);
            }
            if (file.subfolder) {
                badges.push(file.subfolder);
            }
            
            if (badges.length > 0) {
                subjectBadge = badges.map(b => `<span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.5rem; display: inline-block; margin-right: 4px;">${b}</span>`).join('');
            }

            card.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                    <i class="${iconClass} note-icon"></i>
                    <div class="note-info">
                        ${subjectBadge}
                        <h3 class="note-name" title="${file.name}">${file.name}</h3>
                        <div class="note-meta">${sizeDisplay} • ${file.filename.split('.').pop().toUpperCase()}</div>
                    </div>
                </div>
                <div class="note-actions">
                    <a href="${file.path}" target="_blank" class="note-btn btn-view">
                        <i class="fa-solid fa-eye"></i> View
                    </a>
                    <a href="${file.path}" download="${file.filename}" class="note-btn btn-download">
                        <i class="fa-solid fa-download"></i> Download
                    </a>
                </div>
            `;
            notesGrid.appendChild(card);
        });
    }
});
