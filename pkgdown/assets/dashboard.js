import { shinyliveCommunicator } from './shinyliveCommunication-parent.js';
import { getCookie, gh } from './gh.js';

// Check and validate PAT as a promise
const validatedPAT = new Promise(async (resolve, reject) => {
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
const fetchTeams = validatedPAT.then(async (pat) => {
  return gh.fetchUserTeams(pat);
});

// Process teams into groupedTeams
const processedTeams = fetchTeams.then((teams) => {
  return teams.reduce((acc, team) => {
    const orgName = team.organization.login;
    if (!acc[orgName]) {
      acc[orgName] = {};
    }
    acc[orgName][team.name] = team.slug;
    return acc;
  }, {});
});

// Initialize ShinyLive as a promise
const shinyReady = shinyliveCommunicator.initialize('#dashboard-app iframe');

// Handle 'fetchTeamRepos' action
Promise.all([shinyReady, validatedPAT]).then(([iframe, pat]) => {
  const stopFetchingTeamRepos = shinyliveCommunicator.observeAction(
    iframe, 'fetchTeamRepos',
    async (body) => {
      if (body.org && body.team) {
        try {
          const repos = await gh.fetchTeamRepos(pat, body.org, body.team);

          // Process repos into a named list
          const processedRepos = repos.reduce((acc, repo) => {
            acc[repo.name] = {
              url: repo.html_url,
              is_private: repo.private,
              description: repo.description || 'No description available',
              stargazers: repo.stargazers_count || 0,
              watchers: repo.watchers_count || 0,
              forks: repo.forks_count || 0,
              open_issues: repo.open_issues_count || 0
            };
            return acc;
          }, {});

          // Send processed repos back to Shiny
          shinyliveCommunicator.sendMessage(iframe, 'set-var', { name: 'repos', value: processedRepos });
        } catch (error) {
          console.error(`Error fetching repositories for ${body.org}/${body.team}:`, error);
        }
      }
    }
  );
});

// Send data to Shiny when ready
Promise.all([shinyReady, processedTeams]).then(([iframe, groupedTeams]) => {
  shinyliveCommunicator.sendMessage(iframe, 'set-var', { name: 'teams', value: groupedTeams });
});
