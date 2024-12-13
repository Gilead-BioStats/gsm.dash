import { shinyliveCommunicator } from './shinyliveCommunication-parent.js';
import { getCookie, gh } from './gh.js';

// Check and validate PAT as a promise
const validatePat = new Promise(async (resolve, reject) => {
  const pat = getCookie('github_pat');
  if (!pat) {
    console.warn('PAT not found, redirecting to set_pat.html.');
    window.location.href = 'set_pat.html';
    reject(new Error('PAT not found'));
  } else {
    try {
      const isValid = await gh.validatePAT(pat);
      if (!isValid) {
        console.warn('Invalid PAT, redirecting to set_pat.html.');
        window.location.href = 'set_pat.html';
        reject(new Error('Invalid PAT'));
      }
      resolve(pat);
    } catch (error) {
      console.error('Error validating PAT:', error);
      window.location.href = 'set_pat.html';
      reject(error);
    }
  }
});

// Fetch teams as a promise
const fetchTeams = validatePat.then(async (pat) => {
  return gh.fetchUserTeams(pat);
});

// Process teams into groupedTeams
const processedTeams = fetchTeams.then((teams) => {
  return teams.reduce((acc, team) => {
    const orgName = team.organization.name || team.organization.login;
    if (!acc[orgName]) {
      acc[orgName] = [];
    }
    acc[orgName].push(team.name);
    return acc;
  }, {});
});

// Initialize ShinyLive as a promise
const shinyReady = shinyliveCommunicator.initialize('#dashboard-app iframe');

// Send data to Shiny when ready
Promise.all([shinyReady, processedTeams]).then(([iframe, groupedTeams]) => {
  shinyliveCommunicator.sendMessage(iframe, 'set-var', { name: 'teams', value: groupedTeams });
});
