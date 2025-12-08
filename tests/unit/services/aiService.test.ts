import { AIService } from '../../../src/server/services/aiService';
import { AIClientManager } from '../../../src/server/config/ai';

// Mock AIClientManager
jest.mock('../../../src/server/config/ai');

describe('AIService', () => {
  const mockArticleRequest = {
    brandId: '123',
    brandName: 'Test Brand',
    topic: 'Test Topic',
    tone: 'serious' as const,
    length: 'short' as const,
    category: 'Technology',
    includeQuotes: true,
    includeStatistics: true,
    includeCharts: false,
    generateRelatedTitles: 3,
    language: 'en' as const,
    aiProvider: 'openai' as const,
  };

  const mockGeneratedContent = JSON.stringify({
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    content: 'This is a test article content that is roughly long enough to be counted.',
    excerpt: 'Test excerpt',
    authorName: 'Test Author',
    relatedTitles: [
      { title: 'Related 1', category: 'Tech' },
      { title: 'Related 2', category: 'Tech' }
    ],
    tags: ['tag1', 'tag2']
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (AIClientManager.getDefaultModel as jest.Mock).mockReturnValue('test-model');
  });

  describe('generateArticle', () => {
    it('should throw error if provider is not configured', async () => {
      (AIClientManager.isProviderConfigured as jest.Mock).mockReturnValue(false);

      await expect(AIService.generateArticle(mockArticleRequest))
        .rejects
        .toThrow('AI provider openai is not configured');
    });

    it('should generate article using OpenAI', async () => {
      (AIClientManager.isProviderConfigured as jest.Mock).mockReturnValue(true);
      
      const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: mockGeneratedContent } }]
            })
          }
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await AIService.generateArticle(mockArticleRequest);

      expect(result.title).toBe('Test Title');
      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalled();
      expect(result.readTime).toBeGreaterThan(0);
    });

    it('should generate article using Anthropic', async () => {
      const anthropicRequest = { ...mockArticleRequest, aiProvider: 'anthropic' as const };
      (AIClientManager.isProviderConfigured as jest.Mock).mockReturnValue(true);

      const mockAnthropicClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ type: 'text', text: mockGeneratedContent }]
          })
        }
      };
      (AIClientManager.getAnthropicClient as jest.Mock).mockReturnValue(mockAnthropicClient);

      const result = await AIService.generateArticle(anthropicRequest);

      expect(result.title).toBe('Test Title');
      expect(mockAnthropicClient.messages.create).toHaveBeenCalled();
    });

    it('should generate article using Gemini', async () => {
      const geminiRequest = { ...mockArticleRequest, aiProvider: 'gemini' as const };
      (AIClientManager.isProviderConfigured as jest.Mock).mockReturnValue(true);

      const mockGeminiClient = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: { text: () => mockGeneratedContent }
          })
        })
      };
      (AIClientManager.getGeminiClient as jest.Mock).mockReturnValue(mockGeminiClient);

      const result = await AIService.generateArticle(geminiRequest);

      expect(result.title).toBe('Test Title');
      expect(mockGeminiClient.getGenerativeModel).toHaveBeenCalled();
    });

    it('should handle markdown code blocks in response', async () => {
      (AIClientManager.isProviderConfigured as jest.Mock).mockReturnValue(true);
      
      const markdownContent = `\`\`\`json
${mockGeneratedContent}
\`\`\``;

      const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: markdownContent } }]
            })
          }
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await AIService.generateArticle(mockArticleRequest);
      expect(result.title).toBe('Test Title');
    });

    it('should throw error on invalid JSON response', async () => {
      (AIClientManager.isProviderConfigured as jest.Mock).mockReturnValue(true);
      
      const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Invalid JSON' } }]
            })
          }
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      await expect(AIService.generateArticle(mockArticleRequest))
        .rejects
        .toThrow('Failed to generate article');
    });
  });

  describe('generateRelatedTitles', () => {
    const mockTitles = [
      { title: 'Title 1', category: 'Tech' },
      { title: 'Title 2', category: 'Tech' }
    ];

    it('should generate titles using OpenAI', async () => {
      const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: JSON.stringify(mockTitles) } }]
            })
          }
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await AIService.generateRelatedTitles(
        'Topic', 'Category', 3, 'en', 'openai'
      );

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Title 1');
    });

    it('should generate titles using Anthropic', async () => {
      const mockAnthropicClient = {
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ type: 'text', text: JSON.stringify(mockTitles) }]
          })
        }
      };
      (AIClientManager.getAnthropicClient as jest.Mock).mockReturnValue(mockAnthropicClient);

      const result = await AIService.generateRelatedTitles(
        'Topic', 'Category', 3, 'en', 'anthropic'
      );

      expect(result).toHaveLength(2);
    });

    it('should generate titles using Gemini', async () => {
      const mockGeminiClient = {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: { text: () => JSON.stringify(mockTitles) }
          })
        })
      };
      (AIClientManager.getGeminiClient as jest.Mock).mockReturnValue(mockGeminiClient);

      const result = await AIService.generateRelatedTitles(
        'Topic', 'Category', 3, 'en', 'gemini'
      );

      expect(result).toHaveLength(2);
    });

    it('should handle wrapped object response', async () => {
      const wrappedResponse = { titles: mockTitles };
      
      const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: JSON.stringify(wrappedResponse) } }]
            })
          }
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await AIService.generateRelatedTitles(
        'Topic', 'Category', 3, 'en', 'openai'
      );

      expect(result).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
       const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };
      (AIClientManager.getOpenAIClient as jest.Mock).mockReturnValue(mockOpenAIClient);

      const result = await AIService.generateRelatedTitles(
        'Topic', 'Category', 3, 'en', 'openai'
      );

      expect(result).toEqual([]);
    });
  });
});
