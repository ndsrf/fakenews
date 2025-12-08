import { AIClientManager } from '../../../src/server/config/ai';

describe('AIClientManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Reset static properties (private, so we cast to any)
    (AIClientManager as any).openaiClient = null;
    (AIClientManager as any).anthropicClient = null;
    (AIClientManager as any).geminiClient = null;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getOpenAIClient', () => {
    it('should return client if configured', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const client = AIClientManager.getOpenAIClient();
      expect(client).toBeDefined();
    });

    it('should return cached client', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const client1 = AIClientManager.getOpenAIClient();
      const client2 = AIClientManager.getOpenAIClient();
      expect(client1).toBe(client2);
    });

    it('should throw if not configured', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => AIClientManager.getOpenAIClient()).toThrow('OPENAI_API_KEY is not configured');
    });
  });

  describe('getAnthropicClient', () => {
    it('should return client if configured', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const client = AIClientManager.getAnthropicClient();
      expect(client).toBeDefined();
    });

    it('should throw if not configured', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => AIClientManager.getAnthropicClient()).toThrow('ANTHROPIC_API_KEY is not configured');
    });
  });

  describe('getGeminiClient', () => {
    it('should return client if configured', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      const client = AIClientManager.getGeminiClient();
      expect(client).toBeDefined();
    });

    it('should throw if not configured', () => {
      delete process.env.GEMINI_API_KEY;
      expect(() => AIClientManager.getGeminiClient()).toThrow('GEMINI_API_KEY is not configured');
    });
  });

  describe('getDefaultModel', () => {
    it('should return default models', () => {
      delete process.env.OPENAI_MODEL;
      delete process.env.ANTHROPIC_MODEL;
      delete process.env.GEMINI_MODEL;

      expect(AIClientManager.getDefaultModel('openai')).toBe('gpt-4o');
      expect(AIClientManager.getDefaultModel('anthropic')).toBe('claude-sonnet-4-5-20250929');
      expect(AIClientManager.getDefaultModel('gemini')).toBe('gemini-2.0-flash-exp');
    });

    it('should return configured models', () => {
      process.env.OPENAI_MODEL = 'custom-gpt';
      expect(AIClientManager.getDefaultModel('openai')).toBe('custom-gpt');
    });

    it('should throw for unknown provider', () => {
        expect(() => AIClientManager.getDefaultModel('unknown' as any)).toThrow('Unknown provider');
    });
  });

  describe('isProviderConfigured', () => {
    it('should check configuration', () => {
      process.env.OPENAI_API_KEY = 'key';
      expect(AIClientManager.isProviderConfigured('openai')).toBe(true);
      
      delete process.env.OPENAI_API_KEY;
      expect(AIClientManager.isProviderConfigured('openai')).toBe(false);
    });
    
    it('should return false for unknown provider', () => {
        expect(AIClientManager.isProviderConfigured('unknown' as any)).toBe(false);
    });
  });

  describe('getAvailableProviders', () => {
    it('should list available providers', () => {
      process.env.OPENAI_API_KEY = 'key';
      delete process.env.ANTHROPIC_API_KEY;
      process.env.GEMINI_API_KEY = 'key';

      const providers = AIClientManager.getAvailableProviders();
      expect(providers).toContain('openai');
      expect(providers).toContain('gemini');
      expect(providers).not.toContain('anthropic');
    });
  });
});
