import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  model?: string;
}

export class AIClientManager {
  private static openaiClient: OpenAI | null = null;
  private static anthropicClient: Anthropic | null = null;
  private static geminiClient: GoogleGenerativeAI | null = null;

  static getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      this.openaiClient = new OpenAI({ apiKey });
    }
    return this.openaiClient;
  }

  static getAnthropicClient(): Anthropic {
    if (!this.anthropicClient) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not configured');
      }
      this.anthropicClient = new Anthropic({ apiKey });
    }
    return this.anthropicClient;
  }

  static getGeminiClient(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return this.geminiClient;
  }

  static getDefaultModel(provider: 'openai' | 'anthropic' | 'gemini'): string {
    switch (provider) {
      case 'openai':
        return process.env.OPENAI_MODEL || 'gpt-4o';
      case 'anthropic':
        return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';
      case 'gemini':
        return process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  static isProviderConfigured(provider: 'openai' | 'anthropic' | 'gemini'): boolean {
    switch (provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'gemini':
        return !!process.env.GEMINI_API_KEY;
      default:
        return false;
    }
  }

  static getAvailableProviders(): ('openai' | 'anthropic' | 'gemini')[] {
    const providers: ('openai' | 'anthropic' | 'gemini')[] = [];
    if (this.isProviderConfigured('openai')) providers.push('openai');
    if (this.isProviderConfigured('anthropic')) providers.push('anthropic');
    if (this.isProviderConfigured('gemini')) providers.push('gemini');
    return providers;
  }
}
