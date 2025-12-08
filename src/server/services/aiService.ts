import { AIClientManager, AIConfig } from '../config/ai.js';

export interface ArticleGenerationRequest {
  brandId: string;
  brandName: string;
  topic: string;
  tone: 'serious' | 'satirical' | 'dramatic' | 'investigative';
  length: 'short' | 'medium' | 'long';
  category: string;
  includeQuotes: boolean;
  includeStatistics: boolean;
  includeCharts: boolean;
  generateRelatedTitles: number;
  language: 'en' | 'es';
  aiProvider: 'openai' | 'anthropic' | 'gemini';
}

export interface RelatedArticleTitle {
  title: string;
  category: string;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any;
}

export interface GeneratedArticle {
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  authorName: string;
  featuredImage?: string;
  images: string[];
  charts: ChartData[];
  relatedTitles: RelatedArticleTitle[];
  tags: string[];
  readTime: number;
}

export class AIService {
  private static getWordCount(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 300;
      case 'medium':
        return 800;
      case 'long':
        return 1500;
    }
  }

  private static calculateReadTime(content: string): number {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  }

  private static createPrompt(request: ArticleGenerationRequest): string {
    const wordCount = this.getWordCount(request.length);
    const lang = request.language === 'es' ? 'Spanish' : 'English';

    return `You are a professional fictional news article writer for "${request.brandName}", a FICTIONAL news organization.

Generate a FICTIONAL ${request.tone} news article with the following requirements:

Topic: ${request.topic}
Category: ${request.category}
Language: ${lang}
Word Count: Approximately ${wordCount} words
Tone: ${request.tone}

Requirements:
- Write in ${lang} language
- Include ${request.includeQuotes ? 'fictional quotes from fictional sources' : 'no quotes'}
- Include ${request.includeStatistics ? 'fictional statistics and data' : 'no statistics'}
- The article should be in markdown format
- Use proper journalistic structure (lead, body, conclusion)
- Create a compelling headline
- Write a brief subtitle (optional)
- Create a 2-3 sentence excerpt/summary
- Suggest ${request.generateRelatedTitles} related article titles
- Generate 5-8 relevant tags
- Suggest a fictional author name appropriate for ${request.brandName}

CRITICAL: This is FICTIONAL content. All names, events, quotes, and statistics should be clearly fictional.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Main headline",
  "subtitle": "Optional subtitle",
  "content": "Full article in markdown format",
  "excerpt": "Brief summary",
  "authorName": "Fictional Author Name",
  "relatedTitles": [
    {"title": "Related article title 1", "category": "Category"},
    {"title": "Related article title 2", "category": "Category"}
  ],
  "tags": ["tag1", "tag2", "tag3"]
}`;
  }

  static async generateArticle(
    request: ArticleGenerationRequest
  ): Promise<GeneratedArticle> {
    if (!AIClientManager.isProviderConfigured(request.aiProvider)) {
      throw new Error(`AI provider ${request.aiProvider} is not configured`);
    }

    const prompt = this.createPrompt(request);
    let responseText: string;

    try {
      switch (request.aiProvider) {
        case 'openai':
          responseText = await this.generateWithOpenAI(prompt, request);
          break;
        case 'anthropic':
          responseText = await this.generateWithAnthropic(prompt, request);
          break;
        case 'gemini':
          responseText = await this.generateWithGemini(prompt, request);
          break;
        default:
          throw new Error(`Unknown AI provider: ${request.aiProvider}`);
      }

      const parsed = this.parseArticleResponse(responseText);
      const readTime = this.calculateReadTime(parsed.content);

      return {
        ...parsed,
        images: [],
        charts: [],
        readTime,
      };
    } catch (error) {
      console.error('Error generating article:', error);
      throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async generateWithOpenAI(
    prompt: string,
    request: ArticleGenerationRequest
  ): Promise<string> {
    const client = AIClientManager.getOpenAIClient();
    const model = AIClientManager.getDefaultModel('openai');

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional fictional news article writer. Always respond with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    return completion.choices[0]?.message?.content || '';
  }

  private static async generateWithAnthropic(
    prompt: string,
    request: ArticleGenerationRequest
  ): Promise<string> {
    const client = AIClientManager.getAnthropicClient();
    const model = AIClientManager.getDefaultModel('anthropic');

    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    return textContent && textContent.type === 'text' ? textContent.text : '';
  }

  private static async generateWithGemini(
    prompt: string,
    request: ArticleGenerationRequest
  ): Promise<string> {
    const client = AIClientManager.getGeminiClient();
    const modelName = AIClientManager.getDefaultModel('gemini');

    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  private static parseArticleResponse(responseText: string): Omit<GeneratedArticle, 'images' | 'charts' | 'readTime'> {
    try {
      let jsonText = responseText.trim();

      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(jsonText);

      if (!parsed.title || !parsed.content || !parsed.excerpt) {
        throw new Error('Missing required fields in AI response');
      }

      return {
        title: parsed.title,
        subtitle: parsed.subtitle || undefined,
        content: parsed.content,
        excerpt: parsed.excerpt,
        authorName: parsed.authorName || 'Staff Writer',
        featuredImage: parsed.featuredImage,
        relatedTitles: parsed.relatedTitles || [],
        tags: parsed.tags || [],
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse AI response');
    }
  }

  static async generateRelatedTitles(
    topic: string,
    category: string,
    count: number,
    language: 'en' | 'es',
    provider: 'openai' | 'anthropic' | 'gemini'
  ): Promise<RelatedArticleTitle[]> {
    const lang = language === 'es' ? 'Spanish' : 'English';
    const prompt = `Generate ${count} fictional news article titles related to: "${topic}" in the ${category} category.

Write in ${lang} language.

Return ONLY a valid JSON array with this structure:
[
  {"title": "Title 1", "category": "${category}"},
  {"title": "Title 2", "category": "${category}"}
]`;

    try {
      let responseText: string;

      switch (provider) {
        case 'openai': {
          const client = AIClientManager.getOpenAIClient();
          const model = AIClientManager.getDefaultModel('openai');
          const completion = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.9,
            response_format: { type: 'json_object' },
          });
          responseText = completion.choices[0]?.message?.content || '[]';
          break;
        }
        case 'anthropic': {
          const client = AIClientManager.getAnthropicClient();
          const model = AIClientManager.getDefaultModel('anthropic');
          const message = await client.messages.create({
            model,
            max_tokens: 1024,
            temperature: 0.9,
            messages: [{ role: 'user', content: prompt }],
          });
          const textContent = message.content.find((block) => block.type === 'text');
          responseText = textContent && textContent.type === 'text' ? textContent.text : '[]';
          break;
        }
        case 'gemini': {
          const client = AIClientManager.getGeminiClient();
          const modelName = AIClientManager.getDefaultModel('gemini');
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.9,
              responseMimeType: 'application/json',
            },
          });
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
          break;
        }
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(jsonText);

      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.titles && Array.isArray(parsed.titles)) {
        return parsed.titles;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error generating related titles:', error);
      return [];
    }
  }
}
