// src/openai-assistants-example/assistant-client.js
const OpenAI = require('openai');

// Load environment variables from .env file if present (for local development)
// In a real app, you might have a more robust config management
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn("Warning: OPENAI_API_KEY environment variable is not set. OpenAI calls will likely fail.");
  // You might choose to throw an error here in a real application
  // throw new Error("OPENAI_API_KEY environment variable is not set.");
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

/**
 * Creates a new OpenAI Assistant.
 * @param {object} assistantOptions - Options for creating the assistant.
 * @param {string} assistantOptions.name - The name of the assistant.
 * @param {string} assistantOptions.instructions - The system instructions for the assistant.
 * @param {string} assistantOptions.model - The model to use (e.g., "gpt-4o", "gpt-3.5-turbo").
 * @param {Array<object>} [assistantOptions.tools] - Optional tools for the assistant (e.g., { type: 'code_interpreter' }).
 * @returns {Promise<OpenAI.Beta.Assistants.Assistant>} The created assistant object.
 */
async function createAssistant(assistantOptions) {
  if (!openai.apiKey) throw new Error('OpenAI API key not configured.');
  console.log('Creating assistant with options:', assistantOptions);
  const assistant = await openai.beta.assistants.create(assistantOptions);
  console.log('Assistant created:', assistant.id);
  return assistant;
}

/**
 * Creates a new conversation thread.
 * @returns {Promise<OpenAI.Beta.Threads.Thread>} The created thread object.
 */
async function createThread() {
  if (!openai.apiKey) throw new Error('OpenAI API key not configured.');
  console.log('Creating new thread...');
  const thread = await openai.beta.threads.create();
  console.log('Thread created:', thread.id);
  return thread;
}

/**
 * Adds a user message to a thread.
 * @param {string} threadId - The ID of the thread.
 * @param {string} content - The content of the user's message.
 * @returns {Promise<OpenAI.Beta.Threads.Messages.ThreadMessage>} The created message object.
 */
async function addMessageToThread(threadId, content) {
  if (!openai.apiKey) throw new Error('OpenAI API key not configured.');
  console.log(`Adding message to thread ${threadId}: "${content}"`);
  const message = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: content,
  });
  console.log('Message added:', message.id);
  return message;
}

/**
 * Runs an assistant on a thread and waits for completion.
 * @param {string} threadId - The ID of the thread.
 * @param {string} assistantId - The ID of the assistant.
 * @param {string} [instructions] - Optional override for assistant instructions for this specific run.
 * @returns {Promise<OpenAI.Beta.Threads.Runs.Run>} The completed run object.
 */
async function runAssistant(threadId, assistantId, instructions) {
  if (!openai.apiKey) throw new Error('OpenAI API key not configured.');
  console.log(`Running assistant ${assistantId} on thread ${threadId}...`);
  const run = await openai.beta.threads.runs.createAndPoll(threadId, { // createAndPoll handles waiting
     assistant_id: assistantId,
     instructions: instructions, // Optional override
  });

  console.log('Run completed with status:', run.status);
  if (run.status === 'completed') {
     // Messages are automatically added to the thread by the assistant
     return run;
  } else {
     console.error('Run did not complete successfully:', run);
     throw new Error(`Run failed with status: ${run.status}`);
  }
}

/**
 * Lists messages from a thread, optionally after a specific message ID.
 * @param {string} threadId - The ID of the thread.
 * @param {string} [lastMessageId] - Optional. If provided, retrieve messages after this ID.
 * @returns {Promise<OpenAI.Beta.Threads.Messages.ThreadMessagesPage>} A page of message objects.
 */
async function listMessages(threadId, lastMessageId) {
  if (!openai.apiKey) throw new Error('OpenAI API key not configured.');
  console.log(`Listing messages for thread ${threadId}...`);
  const messagesPage = await openai.beta.threads.messages.list(threadId, {
    order: 'asc', // Get messages in ascending order (oldest first)
    after: lastMessageId, // Useful for getting only new messages
  });
  // The actual messages are in messagesPage.data
  console.log(`Found ${messagesPage.data.length} new messages.`);
  return messagesPage;
}

// Example usage (can be commented out or moved to a separate example script)
/*
async function simpleChat() {
  try {
    const assistant = await createAssistant({
      name: 'Math Tutor',
      instructions: 'You are a personal math tutor. Write and run code to answer math questions.',
      model: 'gpt-4o', // Or your preferred model
      tools: [{ type: 'code_interpreter' }],
    });

    const thread = await createThread();
    await addMessageToThread(thread.id, 'What is 2 + 2?');
    await runAssistant(thread.id, assistant.id);
    const messagesPage = await listMessages(thread.id);

    messagesPage.data.forEach(msg => {
      if (msg.role === 'assistant') {
        msg.content.forEach(contentItem => {
          if (contentItem.type === 'text') {
            console.log('Assistant:', contentItem.text.value);
          }
        });
      } else if (msg.role === 'user') {
         console.log('User:', msg.content[0].text.value); // Assuming single text content for user
      }
    });

  } catch (error) {
    console.error('Error in simpleChat:', error);
  }
}
// simpleChat();
*/

module.exports = {
  createAssistant,
  createThread,
  addMessageToThread,
  runAssistant,
  listMessages,
  openai, // Exporting for potential direct use or mocking
};
