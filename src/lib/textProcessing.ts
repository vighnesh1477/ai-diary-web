import { Configuration, OpenAIApi } from 'openai';

interface ProcessedEntry {
  structuredContent: string;
  summary: string;
  topics: string[];
  mood: {
    score: number;
    primaryEmotion: string;
  };
}

export class TextProcessor {
  private static async processWithAI(content: string): Promise<string> {
    try {
      // Initialize OpenAI - In production, use environment variables
      const configuration = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const prompt = `
        Reorganize and structure the following diary entry into a clear, well-organized format.
        Maintain the personal tone but improve clarity and flow. Keep all important details.
        Original entry: ${content}
      `;

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.data.choices[0].text?.trim() || content;
    } catch (error) {
      console.error('Error processing text with AI:', error);
      return content; // Fallback to original content if AI processing fails
    }
  }

  private static extractTopics(content: string): string[] {
    const commonTopics = [
      'work', 'family', 'health', 'relationships', 'goals',
      'emotions', 'activities', 'achievements', 'challenges'
    ];
    
    return commonTopics.filter(topic => 
      content.toLowerCase().includes(topic.toLowerCase())
    );
  }

  private static analyzeMood(content: string): { score: number; primaryEmotion: string } {
    const positiveWords = ['happy', 'excited', 'grateful', 'wonderful', 'amazing', 'love'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'stressed', 'anxious'];
    
    let score = 0;
    const words = content.toLowerCase().split(/\W+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    const normalizedScore = Math.max(-1, Math.min(1, score / 5));
    
    let primaryEmotion = 'neutral';
    if (normalizedScore > 0.3) primaryEmotion = 'positive';
    if (normalizedScore < -0.3) primaryEmotion = 'negative';

    return {
      score: normalizedScore,
      primaryEmotion
    };
  }

  private static generateSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    const firstSentence = sentences[0]?.trim() || '';
    const lastSentence = sentences[sentences.length - 1]?.trim() || '';
    return `${firstSentence}. ${lastSentence}`.trim();
  }

  public static async processEntry(content: string): Promise<ProcessedEntry> {
    const structuredContent = await this.processWithAI(content);
    const topics = this.extractTopics(structuredContent);
    const mood = this.analyzeMood(structuredContent);
    const summary = this.generateSummary(structuredContent);

    return {
      structuredContent,
      summary,
      topics,
      mood
    };
  }
}
