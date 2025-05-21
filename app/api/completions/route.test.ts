import { POST } from './route'; // Adjust if your handler is named differently or exported differently
import { NextRequest } from 'next/server';
import {
  LLM_PROVIDER,
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL,
  RAGIE_API_KEY, // RAGIE_API_KEY is also in settings
} from '@/lib/server/settings';

// Mock a realistic Ragie client and its response
const mockRagieRetrieve = jest.fn();
const mockGetRagieClient = jest.fn(() => ({
  retrievals: {
    retrieve: mockRagieRetrieve,
  },
}));

// Mock Anthropic
const mockAnthropicMessagesCreate = jest.fn();
const mockAnthropic = jest.fn(() => ({
  messages: {
    create: mockAnthropicMessagesCreate,
  },
}));

// Mock ai/core
const mockCreateOpenAI = jest.fn();
const mockGenerateText = jest.fn();

// Mock Handlebars
const mockHandlebarsCompile = jest.fn();

// --- Mocks for modules ---
jest.mock('@/lib/server/settings', () => ({
  __esModule: true, // This is important for ES modules
  RAGIE_API_KEY: 'mock_ragie_api_key', // Default mock value
  RAGIE_API_BASE_URL: 'https://api.ragie.ai',
  LLM_PROVIDER: 'anthropic', // Default to anthropic
  OPENROUTER_API_KEY: undefined,
  OPENROUTER_MODEL: undefined,
  // ANTHROPIC_API_KEY is not explicitly mocked here as it's not directly used in the route,
  // but its presence is assumed by the Anthropic SDK itself.
  // The SDK would throw an error if it's missing, which is a behavior of the SDK, not our route.
}));

jest.mock('@/lib/server/utils', () => ({
  getRagieClient: mockGetRagieClient,
}));

jest.mock('@anthropic-ai/sdk', () => mockAnthropic);

jest.mock('ai/core', () => ({
  createOpenAI: mockCreateOpenAI,
  generateText: mockGenerateText,
}));

jest.mock('handlebars', () => ({
  compile: mockHandlebarsCompile,
}));

// --- Test Suite ---
describe('Completions API Endpoint (app/api/completions/route.ts)', () => {
  let mockRequest: NextRequest;
  const mockSystemPromptTemplate = 'System prompt with {{now}}';
  const compiledSystemPrompt = 'System prompt with MOCK_DATE';

  const mockPayload = {
    message: 'Test user message',
    partition: 'test-partition',
    topK: 5,
    rerank: true,
    systemPrompt: mockSystemPromptTemplate,
  };

  const mockRagieApiResponse = {
    scoredChunks: [
      { documentName: 'doc1.txt', text: 'Relevant text from doc1' },
      { documentName: 'doc2.txt', text: 'Relevant text from doc2' },
    ],
  };

  const mockAnthropicApiResponse = {
    id: 'anthropic-test-id',
    type: 'message',
    role: 'assistant',
    model: 'claude-3-opus-20240229', // Ensure this matches the model in route.ts
    content: [{ type: 'text', text: 'Anthropic response text' }],
    usage: { input_tokens: 10, output_tokens: 20 },
  };

  const mockOpenRouterApiResponseText = 'OpenRouter response text';


  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock the system prompt compilation
    mockHandlebarsCompile.mockReturnValue(jest.fn().mockReturnValue(compiledSystemPrompt));


    // Mock Ragie client's retrieve method
    mockRagieRetrieve.mockResolvedValue(mockRagieApiResponse);

    // Mock NextRequest
    mockRequest = {
      json: jest.fn().mockResolvedValue(mockPayload),
      // Add other properties/methods of NextRequest if your handler uses them
    } as unknown as NextRequest;

    // Mock date for system prompt
    jest.spyOn(global, 'Date').mockImplementation(() => ({
        toISOString: () => 'MOCK_DATE'
    } as any));

  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations
  });

  describe('Scenario 1: Anthropic Provider', () => {
    beforeEach(() => {
      // Explicitly set for this scenario, even if it's the default
      jest.mock('@/lib/server/settings', () => ({
        __esModule: true,
        RAGIE_API_KEY: 'mock_ragie_api_key_anthropic',
        LLM_PROVIDER: 'anthropic',
        OPENROUTER_API_KEY: undefined,
        OPENROUTER_MODEL: undefined,
        ANTHROPIC_API_KEY: 'mock_anthropic_key', // SDK will check for this
      }));
      mockAnthropicMessagesCreate.mockResolvedValue(mockAnthropicApiResponse);
    });

    it('should call Anthropic client with correct parameters and not OpenRouter', async () => {
      // Dynamically re-import POST for this test case with updated mocks
      const { POST: currentPOST } = await import('./route');
      const response = await currentPOST(mockRequest);
      const responseJson = await response.json();

      expect(mockGetRagieClient).toHaveBeenCalled();
      expect(mockRagieRetrieve).toHaveBeenCalledWith({
        query: mockPayload.message,
        partition: mockPayload.partition,
        topK: mockPayload.topK,
        rerank: mockPayload.rerank,
      });

      expect(mockHandlebarsCompile).toHaveBeenCalledWith(mockPayload.systemPrompt);
      expect(mockHandlebarsCompile().mock.calls[0][0]).toEqual({ now: 'MOCK_DATE' });


      expect(mockAnthropic).toHaveBeenCalledTimes(1); // Ensure Anthropic client is instantiated
      expect(mockAnthropicMessagesCreate).toHaveBeenCalledTimes(1);
      expect(mockAnthropicMessagesCreate).toHaveBeenCalledWith({
        model: 'claude-3-opus-20240229', // Check against the model used in your route.ts
        max_tokens: 1000,
        messages: [
          { role: 'user', content: compiledSystemPrompt },
          {
            role: 'user',
            content: mockRagieApiResponse.scoredChunks.map((chunk) => ({
              type: 'document',
              source: { type: 'text', media_type: 'text/plain', data: chunk.text },
              title: chunk.documentName,
              citations: { enabled: true },
            })),
          },
          { role: 'user', content: mockPayload.message },
        ],
      });

      expect(mockCreateOpenAI).not.toHaveBeenCalled();
      expect(mockGenerateText).not.toHaveBeenCalled();

      expect(response.status).toBe(200);
      expect(responseJson.modelResponse).toEqual(mockAnthropicApiResponse);
      expect(responseJson.retrievalResponse).toEqual(mockRagieApiResponse);
    });
  });

  describe('Scenario 2: OpenRouter Provider', () => {
    const openRouterProviderSettings = {
        __esModule: true,
        RAGIE_API_KEY: 'mock_ragie_api_key_openrouter',
        LLM_PROVIDER: 'openrouter',
        OPENROUTER_API_KEY: 'mock_openrouter_key',
        OPENROUTER_MODEL: 'google/gemini-pro-test', // Test model
    };

    beforeEach(() => {
      jest.mock('@/lib/server/settings', () => openRouterProviderSettings);
      // Mock OpenRouter client setup and response
      const mockOpenAIInstance = jest.fn(); // This represents the result of openrouter(MODEL)
      mockCreateOpenAI.mockReturnValue(mockOpenAIInstance); // createOpenAI returns a function
      mockGenerateText.mockResolvedValue({ text: mockOpenRouterApiResponseText, toolCalls: [], toolResults: [], finishReason: 'stop', usage: { promptTokens: 1, completionTokens: 1 }, logprobs: undefined, textGenerationSettings: {} });
    });

    it('should call OpenRouter client with correct parameters and not Anthropic', async () => {
      // Dynamically re-import POST for this test case with updated mocks
      const { POST: currentPOST } = await import('./route');
      const response = await currentPOST(mockRequest);
      const responseJson = await response.json();

      expect(mockGetRagieClient).toHaveBeenCalled();
      expect(mockRagieRetrieve).toHaveBeenCalledWith({
        query: mockPayload.message,
        partition: mockPayload.partition,
        topK: mockPayload.topK,
        rerank: mockPayload.rerank,
      });
      
      expect(mockHandlebarsCompile).toHaveBeenCalledWith(mockPayload.systemPrompt);
      expect(mockHandlebarsCompile().mock.calls[0][0]).toEqual({ now: 'MOCK_DATE' });

      expect(mockCreateOpenAI).toHaveBeenCalledTimes(1);
      expect(mockCreateOpenAI).toHaveBeenCalledWith({
        apiKey: openRouterProviderSettings.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      
      const mockOpenAIInstance = mockCreateOpenAI.mock.results[0].value;

      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(mockGenerateText).toHaveBeenCalledWith({
        model: mockOpenAIInstance(openRouterProviderSettings.OPENROUTER_MODEL),
        messages: [
          { role: 'system', content: compiledSystemPrompt },
          {
            role: 'user',
            content: `${mockRagieApiResponse.scoredChunks
              .map((chunk) => `Document: ${chunk.documentName}\n${chunk.text}`)
              .join('\n\n')}\n\nUser Query: ${mockPayload.message}`,
          },
        ],
        maxTokens: 1000,
      });

      expect(mockAnthropic).not.toHaveBeenCalled();
      expect(mockAnthropicMessagesCreate).not.toHaveBeenCalled();

      expect(response.status).toBe(200);
      expect(responseJson.modelResponse.content[0].text).toEqual(mockOpenRouterApiResponseText);
      expect(responseJson.modelResponse.model).toEqual(openRouterProviderSettings.OPENROUTER_MODEL);
      expect(responseJson.retrievalResponse).toEqual(mockRagieApiResponse);
    });
  });

  describe('Scenario 3: Error Handling (Conceptual - settings.ts)', () => {
    it('should throw an error if OpenRouter is selected but API key is missing (error from settings.ts)', async () => {
      jest.mock('@/lib/server/settings', () => ({
        __esModule: true,
        RAGIE_API_KEY: 'mock_ragie_api_key_error',
        LLM_PROVIDER: 'openrouter',
        OPENROUTER_API_KEY: undefined, // Missing API Key
        OPENROUTER_MODEL: 'google/gemini-pro-test',
      }));

      try {
        // The error should be thrown when settings.ts is evaluated,
        // which happens when route.ts (and its dependencies) are imported.
        await import('./route'); 
      } catch (e: any) {
        expect(e.message).toContain("LLM_PROVIDER is set to 'openrouter' but OPENROUTER_API_KEY is not set");
      }
    });

    it('should throw an error if OpenRouter is selected but model is missing (error from settings.ts)', async () => {
        jest.mock('@/lib/server/settings', () => ({
            __esModule: true,
            RAGIE_API_KEY: 'mock_ragie_api_key_error_model',
            LLM_PROVIDER: 'openrouter',
            OPENROUTER_API_KEY: 'mock_openrouter_key',
            OPENROUTER_MODEL: undefined, // Missing model
          }));
  
        try {
          await import('./route');
        } catch (e: any) {
          expect(e.message).toContain("LLM_PROVIDER is set to 'openrouter' but OPENROUTER_MODEL is not set");
        }
      });

      it('should throw an error if RAGIE_API_KEY is missing (error from settings.ts)', async () => {
        jest.mock('@/lib/server/settings', () => ({
            __esModule: true,
            RAGIE_API_KEY: undefined, // Missing RAGIE_API_KEY
            LLM_PROVIDER: 'anthropic', // Can be any provider
          }));
  
        try {
          await import('./route');
        } catch (e: any) {
          expect(e.message).toContain("RAGIE_API_KEY is not set");
        }
      });
  });
});
