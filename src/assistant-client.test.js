// First mock the OpenAI module before requiring the client
jest.mock('openai', () => {
  const mockAssistants = {
    create: jest.fn(),
  };
  const mockThreads = {
    create: jest.fn(),
    messages: {
      create: jest.fn(),
      list: jest.fn(),
    },
    runs: {
      createAndPoll: jest.fn(), // Mocking createAndPoll
    },
  };
  return jest.fn().mockImplementation(() => ({ // Mock the OpenAI constructor
    beta: {
      assistants: mockAssistants,
      threads: mockThreads,
    },
    // Mock apiKey to prevent "API key not configured" error in tests if constructor is not fully mocked
    apiKey: 'test_api_key_for_jest',
  }));
});

// Now import the client after mocking the OpenAI module
const {
  createAssistant,
  createThread,
  addMessageToThread,
  runAssistant,
  listMessages,
  openai // This will now use the mocked OpenAI instance
} = require('./assistant-client');

// Helper to get the mocked functions from the deeply nested structure
// This is a bit verbose due to the SDK's structure.
let mockCreateAssistantFn;
let mockCreateThreadFn;
let mockAddMessageToThreadFn;
let mockRunAssistantFn; // Specifically createAndPoll
let mockListMessagesFn;

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Re-initialize the mock functions based on the mocked OpenAI constructor
  // This ensures we get the same mock instances that the client code uses.
  // The 'openai' module itself is mocked, so client uses the mocked constructor.
  // We need to get a "handle" to the specific mocked methods.
  // This assumes the client code creates a new OpenAI() instance which is now mocked.
  // If openai instance was exported and imported directly from client we could use that.
  // Since we exported 'openai' from our client, we can get its mocked methods.

  // The 'openai' instance exported from our client module is the one
  // constructed with `new OpenAI()`, which is mocked by jest.mock.
  // So, openai.beta.assistants.create IS our jest.fn().
  mockCreateAssistantFn = openai.beta.assistants.create;
  mockCreateThreadFn = openai.beta.threads.create;
  mockAddMessageToThreadFn = openai.beta.threads.messages.create;
  mockRunAssistantFn = openai.beta.threads.runs.createAndPoll;
  mockListMessagesFn = openai.beta.threads.messages.list;
});

describe('OpenAI Assistant Client', () => {
  // Mock process.env.OPENAI_API_KEY for tests if your client relies on it directly at module load
  // Or ensure the OpenAI constructor mock handles apiKey presence. Our mock does.

  describe('createAssistant', () => {
    it('should call openai.beta.assistants.create with correct parameters', async () => {
      const mockAssistantResponse = { id: 'asst_123', name: 'Test Assistant' };
      mockCreateAssistantFn.mockResolvedValue(mockAssistantResponse);

      const assistantOptions = {
        name: 'Test Assistant',
        instructions: 'Test instructions',
        model: 'gpt-4o',
      };
      const result = await createAssistant(assistantOptions);

      expect(mockCreateAssistantFn).toHaveBeenCalledWith(assistantOptions);
      expect(result).toEqual(mockAssistantResponse);
    });
  });

  describe('createThread', () => {
    it('should call openai.beta.threads.create with correct parameters', async () => {
      const mockThreadResponse = { id: 'thread_123' };
      mockCreateThreadFn.mockResolvedValue(mockThreadResponse);

      const threadOptions = {
        messages: [
          { role: 'user', content: 'Hello, assistant!' }
        ],
        metadata: { user_id: 'test_user_123' }
      };
      const result = await createThread(threadOptions);

      expect(mockCreateThreadFn).toHaveBeenCalledWith(threadOptions);
      expect(result).toEqual(mockThreadResponse);
    });
    
    it('should call openai.beta.threads.create without parameters when no options provided', async () => {
      const mockThreadResponse = { id: 'thread_123' };
      mockCreateThreadFn.mockResolvedValue(mockThreadResponse);

      const result = await createThread();

      expect(mockCreateThreadFn).toHaveBeenCalledTimes(1);
      expect(mockCreateThreadFn).toHaveBeenCalledWith();
      expect(result).toEqual(mockThreadResponse);
    });
  });

  describe('addMessageToThread', () => {
    it('should call openai.beta.threads.messages.create with correct parameters', async () => {
      const mockMessageResponse = { id: 'msg_123', role: 'user', content: [{ type: 'text', text: { value: 'Hello' } }] };
      mockAddMessageToThreadFn.mockResolvedValue(mockMessageResponse);

      const threadId = 'thread_123';
      const content = 'Hello';
      const result = await addMessageToThread(threadId, content);

      expect(mockAddMessageToThreadFn).toHaveBeenCalledWith(threadId, {
        role: 'user',
        content: content,
      });
      expect(result).toEqual(mockMessageResponse);
    });
  });

  describe('runAssistant', () => {
    it('should call openai.beta.threads.runs.createAndPoll and handle completion', async () => {
      const mockRunResponse = { id: 'run_123', status: 'completed' };
      mockRunAssistantFn.mockResolvedValue(mockRunResponse);

      const threadId = 'thread_123';
      const assistantId = 'asst_123';
      const instructions = 'Override instructions';
      const result = await runAssistant(threadId, assistantId, instructions);

      expect(mockRunAssistantFn).toHaveBeenCalledWith(threadId, {
        assistant_id: assistantId,
        instructions: instructions,
      });
      expect(result).toEqual(mockRunResponse);
    });

    it('should throw an error if run does not complete successfully', async () => {
      const mockRunResponse = { id: 'run_123', status: 'failed' };
      mockRunAssistantFn.mockResolvedValue(mockRunResponse);

      const threadId = 'thread_123';
      const assistantId = 'asst_123';
      await expect(runAssistant(threadId, assistantId)).rejects.toThrow('Run failed with status: failed');
    });
  });

  describe('listMessages', () => {
    it('should fetch messages after a specific message when lastMessageId is provided (pagination)', async () => {
      const mockMessagesPage = { data: [{id: 'msg_abc', content: 'Hi'}] };
      mockListMessagesFn.mockResolvedValue(mockMessagesPage);

      const threadId = 'thread_123';
      const lastMessageId = 'msg_prev';
      const result = await listMessages(threadId, lastMessageId);

      expect(mockListMessagesFn).toHaveBeenCalledWith(threadId, {
        order: 'asc',
        after: lastMessageId,
      });
      expect(result).toEqual(mockMessagesPage);
    });

    it('should fetch all messages when no lastMessageId is provided (first page)', async () => {
      const mockMessagesPage = { data: [{id: 'msg_abc', content: 'Hi'}] };
      mockListMessagesFn.mockResolvedValue(mockMessagesPage);

      const threadId = 'thread_123';
      const result = await listMessages(threadId);

      expect(mockListMessagesFn).toHaveBeenCalledWith(threadId, {
        order: 'asc',
      });
      expect(result).toEqual(mockMessagesPage);
    });
  });
});
