document.getElementById('submit').addEventListener('click', async () => {
  const pat = document.getElementById('pat').value;
  const steps = document.getElementById('steps');

  if (!pat) {
    alert('Please enter a GitHub PAT.');
    return;
  }

  try {
    // Step 4: Validate the PAT
    const isValid = await validatePAT(pat);

    let step4 = document.getElementById('step-4');
    if (!step4) {
      step4 = document.createElement('li');
      step4.id = 'step-4';
      steps.appendChild(step4);
    }

    if (isValid) {
      step4.textContent = 'Validate the PAT: valid!';
      savePAT(pat);

      // Step 5: Provide a link back to the referring page if it exists
      const referrer = document.referrer;

      if (referrer && new URL(referrer).origin === location.origin) {
        let step5 = document.getElementById('step-5');
        if (!step5) {
          step5 = document.createElement('li');
          step5.id = 'step-5';
          steps.appendChild(step5);
        }
        step5.innerHTML = `<a href="${referrer}">Return to the previous page</a>`;
      }
    } else {
      step4.textContent = 'Validate the PAT: PAT failed to validate. Try another PAT.';
    }
  } catch (error) {
    let step4 = document.getElementById('step-4');
    if (!step4) {
      step4 = document.createElement('li');
      step4.id = 'step-4';
      steps.appendChild(step4);
    }
    step4.textContent = `Error: ${error.message}`;
  }
});
