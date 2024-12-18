// Utility to get a cookie value by name
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// In-memory cache
const ghCache = new Map();

export const gh = {
  // Save the PAT in a cookie
  savePAT(pat) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.cookie = `github_pat=${encodeURIComponent(pat)}; expires=${expirationDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
  },

  // General function to call GitHub API endpoints with caching
  async endpoint(pat, endpoint) {
    const url = `https://api.github.com/${endpoint}`;
    const cached = ghCache.get(url);

    // Prepare headers, including conditional request headers if cached
    const headers = {
      'Authorization': `Bearer ${pat}`,
      'Accept': 'application/vnd.github.v3+json'
    };
    if (cached?.etag) headers['If-None-Match'] = cached.etag;
    if (cached?.lastModified) headers['If-Modified-Since'] = cached.lastModified;

    try {
      const response = await fetch(url, { method: 'GET', headers });

      if (response.status === 304) {
        // Not modified, return cached data
        console.log(`Cache hit for ${endpoint}`);
        return cached.data;
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      // Store the response in the cache with headers for future use
      ghCache.set(url, {
        data: responseData,
        etag: response.headers.get('ETag'),
        lastModified: response.headers.get('Last-Modified')
      });
      return responseData;
    } catch (error) {
      console.error(`Error calling GitHub endpoint '${endpoint}':`, error);
      throw error;
    }
  },

  // Validate the PAT by making a simple API call to verify its scope
  async validatePAT(pat) {
    try {
      const userData = await this.endpoint(pat, 'user');
      return !!userData?.login; // Valid if the user object contains a login property
    } catch (error) {
      console.error('Error validating PAT:', error);
      return false;
    }
  },

  // Fetch user teams using the PAT
  async fetchUserTeams(pat) {
    try {
      const response = await this.endpoint(pat, 'user/teams');
      return response // Returns a list of teams
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
      return response;
    } catch (error) {
      console.error(`Error fetching repositories for team '${team}' in organization '${org}':`, error);
      throw error;
    }
  },

  // Fetch pull requests for a repository in an organization
  async fetchRepoPullRequests(pat, org, repo) {
    try {
      const endpoint = `repos/${org}/${repo}/pulls`;
      const response = await this.endpoint(pat, endpoint);

      // Extract only relevant fields from the pull requests
      return response.map(pr => ({
        id: pr.id,
        state: pr.state,
        created_at: pr.created_at,
        updated_at: pr.updated_at || null,
        merged_at: pr.merged_at || null
      }));
    } catch (error) {
      console.error(`Error fetching pull requests for repository '${repo}' in organization '${org}':`, error);
      throw error;
    }
  }
};
