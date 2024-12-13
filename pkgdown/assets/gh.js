// Utility to get a cookie value by name
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export const gh = {
  // Save the PAT in a cookie
  savePAT(pat) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.cookie = `github_pat=${encodeURIComponent(pat)}; expires=${expirationDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
  },

  // General function to call GitHub API endpoints
  async endpoint(pat, endpoint) {
    const url = `https://api.github.com/${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pat}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`Error calling GitHub endpoint '${endpoint}':`, error);
      throw error;
    }
  },

  // Validate the PAT by making a simple API call to verify its scope
  async validatePAT(pat) {
    try {
      const response = await this.endpoint(pat, 'user');
      return response.ok; // Valid if the response is OK (status 200)
    } catch (error) {
      console.error('Error validating PAT:', error);
      return false;
    }
  },

  // Fetch user teams using the PAT
  async fetchUserTeams(pat) {
    try {
      const response = await this.endpoint(pat, 'user/teams');
      return response.json(); // Returns a list of teams
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  },

  // Fetch repositories for a specific team in an organization
  async fetchTeamRepos(pat, org, team) {
    try {
      const endpoint = `orgs/${org}/teams/${team}/repos`;
      const response = await this.endpoint(pat, endpoint);
      return response.json();
    } catch (error) {
      console.error(`Error fetching repositories for team '${team}' in organization '${org}':`, error);
      throw error;
    }
  }
};
