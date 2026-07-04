/**
 * PeopleCore HRMS — Recruitment Page Module
 * Displays the hiring pipeline board matching the layout of the user screenshot.
 */

const RecruitmentPage = {
  activeJobId: 'all', // Current job filter
  pipelineData: null,
  activeJobs: [],

  render: async (container) => {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Recruitment</h1>
          <p>Manage your hiring pipeline and candidate progression.</p>
        </div>
        <button class="btn btn-primary" id="post-job-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Post New Job</span>
        </button>
      </div>

      <div class="recruitment-layout">
        <!-- Kanban Board Area -->
        <div class="kanban-container">
          <div class="kanban-board" id="kanban-board">
            <!-- Columns rendered here -->
          </div>
        </div>

        <!-- Sidebar Area -->
        <div class="recruitment-sidebar">
          <!-- Active Pipelines Count Card -->
          <div class="pipeline-hero-card">
            <div class="pipeline-label">Active Pipelines</div>
            <div class="pipeline-count" id="active-pipelines-count">24</div>
            <div class="pipeline-badge" id="new-applicants-badge">142 New Applicants</div>
          </div>

          <!-- Active Jobs List -->
          <div class="active-jobs-card">
            <div class="active-jobs-header">
              <h3>Active Jobs</h3>
              <div class="filter-icon" id="jobs-filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              </div>
            </div>
            <div class="active-jobs-list" id="active-jobs-list">
              <!-- Jobs list items rendered here -->
            </div>
            <div class="view-archives">
              <a href="#" id="view-all-archives">View All Archives</a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Fetch and draw
    await RecruitmentPage.fetchData();
    RecruitmentPage.setupEvents();
    
    // Bind search handler
    window.addEventListener('globalSearch', RecruitmentPage.handleSearch);
  },

  fetchData: async () => {
    try {
      const pipelineRes = await window.API.getRecruitmentPipeline();
      RecruitmentPage.pipelineData = pipelineRes.pipeline;
      
      // Update sidebar counts
      document.getElementById('active-pipelines-count').textContent = pipelineRes.stats.totalPipelines;
      document.getElementById('new-applicants-badge').textContent = `${pipelineRes.stats.newApplicants} New Applicants`;

      const jobsRes = await window.API.getActiveJobs();
      RecruitmentPage.activeJobs = jobsRes;

      RecruitmentPage.drawBoard();
      RecruitmentPage.drawJobList();
    } catch (err) {
      console.error(err);
    }
  },

  drawBoard: (searchQuery = '') => {
    const board = document.getElementById('kanban-board');
    if (!board) return;

    // Define column schemas
    const columns = [
      { id: 'applied', title: 'Applied' },
      { id: 'phone-screen', title: 'Phone Screen' },
      { id: 'interview', title: 'Interview' },
      { id: 'offer', title: 'Offer' },
      { id: 'hired', title: 'Hired' }
    ];

    board.innerHTML = columns.map(col => {
      // Get candidates for this column, filter by search query and active job
      let list = RecruitmentPage.pipelineData[col.id] || [];
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.position.toLowerCase().includes(q)
        );
      }

      return `
        <div class="kanban-column" data-stage="${col.id}">
          <div class="column-header">
            <div class="column-title">
              <span>${col.title.toUpperCase()}</span>
              <span class="column-count">(${list.length})</span>
            </div>
            <div class="column-menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </div>
          </div>
          <div class="column-cards" id="column-${col.id}" ondragover="event.preventDefault()">
            ${list.map(c => `
              <div class="candidate-card" draggable="true" data-id="${c.id}" data-job-id="${c.jobId || 'all'}">
                <div class="candidate-top">
                  <div class="candidate-info">
                    <h4>${c.name}</h4>
                    <p>${c.position}</p>
                  </div>
                  <div class="candidate-rating">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>${c.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div class="candidate-bottom">
                  <span class="source-badge ${c.source.toLowerCase().replace('.', '')}">${c.source}</span>
                  <span class="candidate-time">${c.timeAgo || 'Just now'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    RecruitmentPage.setupDragAndDrop();
  },

  drawJobList: () => {
    const listContainer = document.getElementById('active-jobs-list');
    if (!listContainer) return;

    listContainer.innerHTML = RecruitmentPage.activeJobs.map(job => {
      // Calculate progress percentage and select bar class
      const totalDays = 30; // standard job listing lifecycle
      const daysLeft = job.daysLeft;
      const progressPercent = Math.min(100, Math.max(0, (daysLeft / totalDays) * 100));
      
      let barClass = 'safe';
      if (daysLeft <= 3) {
        barClass = 'urgent';
      } else if (daysLeft <= 10) {
        barClass = 'normal';
      }

      return `
        <div class="job-item" data-id="${job.id}">
          <div class="job-details">
            <div class="job-title">${job.title}</div>
            <div class="job-meta">
              <div class="job-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span>${job.applicantsCount} apps</span>
              </div>
              <div class="job-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>${job.daysLeft} days left</span>
              </div>
            </div>
            <div class="job-progress">
              <div class="job-progress-bar ${barClass}" style="width: ${progressPercent}%"></div>
            </div>
          </div>
          <svg class="job-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      `;
    }).join('');
  },

  setupDragAndDrop: () => {
    const cards = document.querySelectorAll('.candidate-card');
    const columns = document.querySelectorAll('.column-cards');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
        card.style.opacity = '0.5';
      });

      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });
    });

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.style.background = 'rgba(41, 98, 255, 0.05)';
        col.style.borderRadius = 'var(--radius-lg)';
      });

      col.addEventListener('dragleave', () => {
        col.style.background = '';
      });

      col.addEventListener('drop', async (e) => {
        e.preventDefault();
        col.style.background = '';
        
        const candidateId = e.dataTransfer.getData('text/plain');
        const targetStage = col.closest('.kanban-column').getAttribute('data-stage');
        
        // Update model locally first
        let updatedCand = null;
        let originalStage = '';

        for (const stage in RecruitmentPage.pipelineData) {
          const idx = RecruitmentPage.pipelineData[stage].findIndex(c => c.id === candidateId);
          if (idx !== -1) {
            originalStage = stage;
            updatedCand = RecruitmentPage.pipelineData[stage].splice(idx, 1)[0];
            break;
          }
        }

        if (updatedCand) {
          updatedCand.stage = targetStage;
          if (!RecruitmentPage.pipelineData[targetStage]) {
            RecruitmentPage.pipelineData[targetStage] = [];
          }
          RecruitmentPage.pipelineData[targetStage].push(updatedCand);
          
          RecruitmentPage.drawBoard();
          
          // Sync with API
          try {
            await window.API.updateCandidateStage(updatedCand.jobId || 'all', candidateId, targetStage);
            window.PeopleCore.showToast(`Candidate moved to ${targetStage.replace('-', ' ')}`, 'success');
          } catch (err) {
            // Revert on API fail
            const idx = RecruitmentPage.pipelineData[targetStage].findIndex(c => c.id === candidateId);
            if (idx !== -1) RecruitmentPage.pipelineData[targetStage].splice(idx, 1);
            RecruitmentPage.pipelineData[originalStage].push(updatedCand);
            RecruitmentPage.drawBoard();
            window.PeopleCore.showToast('Failed to update stage. Reverting.', 'error');
          }
        }
      });
    });
  },

  setupEvents: () => {
    // Post new job modal trigger
    const postJobBtn = document.getElementById('post-job-btn');
    if (postJobBtn) {
      postJobBtn.addEventListener('click', RecruitmentPage.showPostJobModal);
    }

    // Filter jobs search click
    const jobsList = document.getElementById('active-jobs-list');
    if (jobsList) {
      jobsList.addEventListener('click', (e) => {
        const item = e.target.closest('.job-item');
        if (!item) return;

        const jobId = item.getAttribute('data-id');
        window.PeopleCore.showToast(`Filtered candidates by job listing`, 'info');
      });
    }

    // View archives click
    const archivesBtn = document.getElementById('view-all-archives');
    if (archivesBtn) {
      archivesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.PeopleCore.showToast('No archived postings found', 'info');
      });
    }
  },

  handleSearch: (e) => {
    const query = e.detail;
    RecruitmentPage.drawBoard(query);
  },

  showPostJobModal: () => {
    const bodyHtml = `
      <form id="post-job-form">
        <div class="form-group">
          <label class="form-label" for="job-title">Job Title</label>
          <input type="text" class="form-input" id="job-title" placeholder="e.g. Senior Frontend Developer" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="job-dept">Department</label>
          <select class="form-input" id="job-dept" required>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="hr">Human Resources</option>
            <option value="operations">Operations</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="job-desc">Job Description</label>
          <textarea class="form-textarea" id="job-desc" placeholder="Describe the role requirements and expectations..." required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="job-location">Location</label>
            <input type="text" class="form-input" id="job-location" value="Remote">
          </div>
          <div class="form-group">
            <label class="form-label" for="job-type">Type</label>
            <select class="form-input" id="job-type">
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.PeopleCore.hideModal()">Cancel</button>
      <button class="btn btn-primary" id="submit-job-btn">Publish Listing</button>
    `;

    window.PeopleCore.showModal('Post New Job Listing', bodyHtml, footerHtml);

    // Bind form submit
    document.getElementById('submit-job-btn').addEventListener('click', async () => {
      const form = document.getElementById('post-job-form');
      if (!form.reportValidity()) return;

      const newJob = {
        title: document.getElementById('job-title').value,
        department: document.getElementById('job-dept').value,
        description: document.getElementById('job-desc').value,
        location: document.getElementById('job-location').value,
        type: document.getElementById('job-type').value,
        deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() // 30 days deadline
      };

      try {
        await window.API.postJob(newJob);
        window.PeopleCore.hideModal();
        window.PeopleCore.showToast('Listing published successfully!', 'success');
        await RecruitmentPage.fetchData();
      } catch (err) {
        window.PeopleCore.showToast(err.message, 'error');
      }
    });
  }
};

window.RecruitmentPage = RecruitmentPage;
