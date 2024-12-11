document.getElementById('submit').addEventListener('click', async () => {
  const pat = document.getElementById('pat').value;

  if (!pat) {
    alert('Please enter a GitHub PAT.');
    return;
  }

  // Set cookie for the PAT
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  document.cookie = `github_pat=${encodeURIComponent(pat)}; expires=${expirationDate.toUTCString()}; path=/; Secure; SameSite=Strict`;

  const outputDiv = document.getElementById('output');
  const messageP = document.getElementById('message');

  try {
    const response = await fetch('https://api.github.com/orgs/Gilead-BioStats/teams/gsm/repos', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos = await response.json();
    messageP.textContent = `Success! You have access to ${repos.length} repositories.`;
  } catch (error) {
    messageP.textContent = `Error: ${error.message}`;
  }

  outputDiv.classList.remove('hidden');
});
