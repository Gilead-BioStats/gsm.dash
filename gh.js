// Utility to get a cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// General function to call GitHub API endpoints
async function ghEndpoint(pat, endpoint) {
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
}

// Validate the PAT by making a simple API call to verify its scope
async function validatePAT(pat) {
  try {
    const response = await ghEndpoint(pat, 'user');
    return response.ok; // Valid if the response is OK (status 200)
  } catch (error) {
    console.error('Error validating PAT:', error);
    return false;
  }
}

// Fetch repositories using the PAT
async function fetchRepos(pat) {
  try {
    const response = await ghEndpoint(pat, 'orgs/Gilead-BioStats/teams/gsm/repos');
    return response.json();
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
}

// Save the PAT in a cookie
function savePAT(pat) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  document.cookie = `github_pat=${encodeURIComponent(pat)}; expires=${expirationDate.toUTCString()}; path=/; Secure; SameSite=Strict`;
}
