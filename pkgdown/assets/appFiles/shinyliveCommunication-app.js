Shiny.addCustomMessageHandler('post-message', function(message) {
  postMessageToParent(message.action, message.body);
});

/**
 * Sends a message to the parent window.
 *
 * @param {string} action - The action to send.
 * @param {object} body   - The message body to include.
 */
const postMessageToParent = function (action, body) {
  window.parent.postMessage({ action, body }, '*');
};

/**
 * Processes a 'set-var' action by updating Shiny input values.
 *
 * @param {string} name  - The name of the variable to set.
 * @param {any}    value - The value of the variable to set.
 * @param {string} [type] - Optional type indicating how Shiny should handle the input.
 */
const processSetVar = function (name, value, type) {
  if (!name) {
    console.error('❌ Missing name for set-var action.');
    return;
  }
  if (value === undefined) {
    console.warn(`⚠️ Variable '${name}' is being set with an undefined value.`);
  }
  const inputName = type ? `${name}:${type}` : name;
  Shiny.setInputValue(inputName, value);
};

/**
 * Processes a message action by validating the action and performing the
 * corresponding operation.
 *
 * @param {string} action - The action to process.
 * @param {object} body   - Additional parameters for this action.
 */
const processMessageAction = function (action, body) {
  const knownActions = ['set-var'];

  if (action === 'set-var') {
    processSetVar(body.name, body.value, body.type);
  } else {
    console.error(
      `❌ Unknown message event action: '${action}'\n` +
      `ℹ️ Known message event actions: ${knownActions.map(action => `'${action}'`).join(', ')}`
    );
  }
};

/**
 * Adds a message listener to handle incoming messages from the parent window.
 * Messages with action 'set-var' update Shiny input values.
 */
const addMessageListener = function () {
  window.addEventListener('message', function (event) {
    processMessageAction(event.data.action, event.data.body);
  });
};

/**
 * Signals to the parent window that the Shiny app is ready by posting a
 * 'shiny-ready' action. This is triggered after the Shiny initializedPromise
 * resolves.
 */
const signalShinyReady = function () {
  Shiny.initializedPromise.then(() => {
    postMessageToParent('shiny-ready', {});
  });
};

document.addEventListener('DOMContentLoaded', addMessageListener);
document.addEventListener('DOMContentLoaded', signalShinyReady);
