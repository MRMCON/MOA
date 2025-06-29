import OpenAI from 'openai';

interface GeneratedContent {
  headline: string;
  body: string;
  callToAction: string;
}

interface GenerationParams {
  goal: string;
  productName: string;
  tone: string;
  clientName?: string;
  businessType?: string;
  targetAudience?: string;
  additionalContext?: string;
}

class AIService {
  private openai: OpenAI | null = null;
  private isConfigured = false;

  constructor() {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your-api-key-here') {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
      });
      this.isConfigured = true;
    }
  }

  async generateContent(params: GenerationParams): Promise<GeneratedContent> {
    // If AI is configured, try AI generation first
    if (this.isConfigured && this.openai) {
      try {
        return await this.generateWithAI(params);
      } catch (error) {
        console.warn('AI generation failed, falling back to templates:', error);
        // Fall back to template-based generation
        return this.generateWithTemplates(params);
      }
    }

    // Use template-based generation as fallback
    return this.generateWithTemplates(params);
  }

  private async generateWithAI(params: GenerationParams): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(params);

    const completion = await this.openai!.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert social media content creator specializing in South African markets. 
          Create engaging, authentic social media posts that resonate with local audiences while maintaining professional standards.
          
          Always respond with a JSON object containing exactly these three fields:
          - headline: A compelling headline/title (max 60 characters)
          - body: The main post content (max 280 characters for social media)
          - callToAction: A clear call-to-action (max 50 characters)
          
          Make content feel authentic and avoid overly promotional language.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      const parsed = JSON.parse(response);
      
      // Validate the response structure
      if (!parsed.headline || !parsed.body || !parsed.callToAction) {
        throw new Error('Invalid response structure');
      }

      return {
        headline: parsed.headline.trim(),
        body: parsed.body.trim(),
        callToAction: parsed.callToAction.trim()
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }
  }

  private buildPrompt(params: GenerationParams): string {
    const { goal, productName, tone, clientName, businessType, targetAudience, additionalContext } = params;

    let prompt = `Create a social media post with the following requirements:

GOAL: ${goal}
PRODUCT/SERVICE: ${productName}
TONE: ${tone}`;

    if (clientName) {
      prompt += `\nCLIENT: ${clientName}`;
    }

    if (businessType) {
      prompt += `\nBUSINESS TYPE: ${businessType}`;
    }

    if (targetAudience) {
      prompt += `\nTARGET AUDIENCE: ${targetAudience}`;
    }

    if (additionalContext) {
      prompt += `\nADDITIONAL CONTEXT: ${additionalContext}`;
    }

    // Add tone-specific instructions
    switch (tone) {
      case 'sa-localized':
        prompt += `\n\nMake this authentically South African. Use local expressions naturally (like "howzit", "lekker", "eish") but don't overdo it. Reference South African culture, locations, or experiences where relevant.`;
        break;
      case 'conversational':
        prompt += `\n\nMake this sound like a friendly conversation. Use casual language, contractions, and a warm, approachable tone.`;
        break;
      case 'professional':
        prompt += `\n\nMaintain a professional, authoritative tone while still being engaging. Use industry-appropriate language.`;
        break;
      case 'playful':
        prompt += `\n\nMake this fun and energetic! Use emojis, playful language, and create excitement.`;
        break;
    }

    // Add goal-specific instructions
    switch (goal) {
      case 'awareness':
        prompt += `\n\nFocus on introducing the brand/product and building recognition. Educate the audience about what makes this special.`;
        break;
      case 'sales':
        prompt += `\n\nCreate urgency and desire. Highlight benefits and include a strong sales-focused call-to-action.`;
        break;
      case 'engagement':
        prompt += `\n\nEncourage interaction. Ask questions, invite comments, or create content that people want to share.`;
        break;
      case 'launch':
        prompt += `\n\nBuild excitement for something new. Create anticipation and highlight what makes this launch special.`;
        break;
    }

    prompt += `\n\nReturn your response as a JSON object with headline, body, and callToAction fields.`;

    return prompt;
  }

  private generateWithTemplates(params: GenerationParams): GeneratedContent {
    const { goal, productName, tone } = params;

    // Enhanced template system with more variety
    const templates = {
      awareness: {
        professional: [
          {
            headline: `Discover Excellence with ${productName}`,
            body: `At the forefront of innovation, ${productName} represents our commitment to delivering exceptional value. Our expertise and dedication ensure that every interaction exceeds expectations.`,
            callToAction: 'Learn more about our services'
          },
          {
            headline: `Introducing ${productName}`,
            body: `We're proud to present ${productName}, a solution designed with your needs in mind. Experience the difference that quality and attention to detail can make.`,
            callToAction: 'Discover the difference'
          }
        ],
        conversational: [
          {
            headline: `Hey there! Meet ${productName} 👋`,
            body: `We're super excited to share ${productName} with you! It's been a game-changer for so many of our customers, and we think you'll love what it can do for you too.`,
            callToAction: 'Check it out and let us know what you think!'
          },
          {
            headline: `You're going to love ${productName}! ❤️`,
            body: `Honestly, we can't stop talking about ${productName}. It's one of those things that just makes life easier, and we had to share it with you!`,
            callToAction: 'See what all the fuss is about'
          }
        ],
        'sa-localized': [
          {
            headline: `Sawubona! Introducing ${productName}`,
            body: `We're proudly South African and excited to bring you ${productName}! Made with local love and international standards, it's designed specifically for our beautiful country.`,
            callToAction: 'Support local - try it today!'
          },
          {
            headline: `Howzit! Check out ${productName}`,
            body: `Eish, we're so stoked to share ${productName} with you! This is proper lekker stuff, made right here in Mzansi with all the care you deserve.`,
            callToAction: 'Come see what we\'re about!'
          }
        ],
        friendly: [
          {
            headline: `Meet your new favorite: ${productName}`,
            body: `We believe you deserve the best, and that's exactly what ${productName} delivers. It's designed to make your life better in all the right ways.`,
            callToAction: 'Give it a try today'
          }
        ],
        authoritative: [
          {
            headline: `The definitive solution: ${productName}`,
            body: `Based on extensive research and industry expertise, ${productName} sets the new standard. Join the professionals who trust our proven approach.`,
            callToAction: 'See the evidence'
          }
        ],
        playful: [
          {
            headline: `🎉 Say hello to ${productName}!`,
            body: `Ready for something amazing? ${productName} is here to add some serious fun to your day! Trust us, you're going to want to tell everyone about this! ✨`,
            callToAction: 'Join the fun! 🚀'
          }
        ]
      },
      sales: {
        professional: [
          {
            headline: `Transform Your Business with ${productName}`,
            body: `Invest in ${productName} and experience measurable results. Our proven solution delivers ROI through enhanced efficiency and superior performance.`,
            callToAction: 'Get your quote today'
          },
          {
            headline: `Maximize ROI with ${productName}`,
            body: `Smart businesses choose ${productName} for its proven track record and exceptional value proposition. Join industry leaders who've already made the switch.`,
            callToAction: 'Request a consultation'
          }
        ],
        conversational: [
          {
            headline: `Ready to level up? ${productName} is here! 🚀`,
            body: `Seriously, ${productName} is going to change the game for you. Don't just take our word for it - our customers are seeing amazing results already!`,
            callToAction: 'Grab yours now - limited time offer!'
          },
          {
            headline: `This is it - ${productName} is what you need!`,
            body: `We've been waiting to tell you about this! ${productName} is flying off the shelves because it actually works. Don't miss out on this one.`,
            callToAction: 'Order before it\'s gone!'
          }
        ],
        'sa-localized': [
          {
            headline: `Eish! ${productName} is the Real Deal`,
            body: `No jokes, ${productName} is exactly what you've been looking for. Made for South Africans, by South Africans. Your wallet and your business will thank you!`,
            callToAction: 'Order now - we deliver nationwide!'
          },
          {
            headline: `Ag man, ${productName} is lekker good!`,
            body: `Listen here, this ${productName} is the business! We're not just saying that - ask anyone who's tried it. Proper quality at a fair price, hey.`,
            callToAction: 'Get yours today, boet!'
          }
        ],
        friendly: [
          {
            headline: `You deserve ${productName}`,
            body: `We know you work hard, and you deserve something that works just as hard for you. ${productName} is our way of saying thank you for being awesome.`,
            callToAction: 'Treat yourself today'
          }
        ],
        authoritative: [
          {
            headline: `Industry leaders choose ${productName}`,
            body: `When performance matters, professionals choose ${productName}. Backed by data, proven by results, trusted by experts in the field.`,
            callToAction: 'Join the professionals'
          }
        ],
        playful: [
          {
            headline: `🛒 Shopping spree time! Get ${productName}`,
            body: `Okay, we're not saying ${productName} will change your life... but it totally will! 😉 Limited stock, unlimited awesome. Don't say we didn't warn you! 🎁`,
            callToAction: 'Add to cart now! 💳'
          }
        ]
      },
      launch: {
        professional: [
          {
            headline: `Introducing ${productName}: Innovation Redefined`,
            body: `We are pleased to announce the launch of ${productName}. This groundbreaking solution represents months of research and development, designed to meet your evolving needs.`,
            callToAction: 'Be among the first to experience innovation'
          }
        ],
        conversational: [
          {
            headline: `🎉 IT'S HERE! ${productName} has officially launched!`,
            body: `We've been working on this for ages and we're finally ready to share ${productName} with the world! This is just the beginning of something amazing.`,
            callToAction: 'Join the launch party - get yours first!'
          }
        ],
        'sa-localized': [
          {
            headline: `Yebo! ${productName} is Finally Here!`,
            body: `After months of hard work, we're stoked to launch ${productName}! This is our proudest moment yet, and we can't wait for you to be part of this journey with us.`,
            callToAction: 'Be part of our story - order today!'
          }
        ],
        friendly: [
          {
            headline: `The wait is over - ${productName} is here!`,
            body: `We've been so excited to share this with you! ${productName} is everything we hoped it would be and more. Thank you for being patient with us.`,
            callToAction: 'Experience it for yourself'
          }
        ],
        authoritative: [
          {
            headline: `${productName}: Setting New Industry Standards`,
            body: `Today marks a significant milestone in our industry. ${productName} introduces capabilities previously thought impossible, backed by rigorous testing and validation.`,
            callToAction: 'Access the future today'
          }
        ],
        playful: [
          {
            headline: `🚀 LAUNCH DAY! ${productName} is live!`,
            body: `Houston, we have liftoff! 🌟 ${productName} is officially out in the wild and ready to make some magic happen. Are you ready for this adventure? 🎊`,
            callToAction: 'Blast off with us! 🚀'
          }
        ]
      },
      engagement: {
        professional: [
          {
            headline: `Share Your Experience with ${productName}`,
            body: `We value your insights and would appreciate hearing about your experience with ${productName}. Your feedback helps us continue to improve and serve you better.`,
            callToAction: 'Share your thoughts in the comments'
          }
        ],
        conversational: [
          {
            headline: `Tell us about your ${productName} experience! 💬`,
            body: `We love hearing from you! How has ${productName} been working for you? Drop a comment and let the community know - your experience might help someone else!`,
            callToAction: 'Comment below and tag a friend!'
          }
        ],
        'sa-localized': [
          {
            headline: `Howzit! How's ${productName} treating you?`,
            body: `We're all about that Ubuntu spirit here! Share your ${productName} story with our community. Whether it's good, bad, or somewhere in between - we want to hear from you!`,
            callToAction: 'Drop a comment and let\'s chat!'
          }
        ],
        friendly: [
          {
            headline: `We'd love to hear from you about ${productName}`,
            body: `Your voice matters to us! Whether you've been using ${productName} for a while or just getting started, we'd love to know how it's going.`,
            callToAction: 'Share your story with us'
          }
        ],
        authoritative: [
          {
            headline: `${productName} User Feedback Initiative`,
            body: `As part of our commitment to excellence, we're gathering comprehensive feedback on ${productName}. Your professional insights contribute to our continuous improvement process.`,
            callToAction: 'Contribute to our research'
          }
        ],
        playful: [
          {
            headline: `🗣️ Spill the tea! How's ${productName}?`,
            body: `We're dying to know - what's your ${productName} story? The good, the great, the "OMG this is amazing!" moments. Share it all! We're here for it! 🍵✨`,
            callToAction: 'Spill it in the comments! 💬'
          }
        ]
      },
      education: {
        professional: [
          {
            headline: `Understanding ${productName}: A Professional Guide`,
            body: `Knowledge is power. Learn how ${productName} can enhance your operations through our comprehensive educational resources and expert insights.`,
            callToAction: 'Access our learning center'
          }
        ],
        conversational: [
          {
            headline: `Let's talk about ${productName} - what you need to know`,
            body: `Ever wondered how ${productName} actually works? We're breaking it down in simple terms so you can make the best decision for your needs.`,
            callToAction: 'Learn more in our guide'
          }
        ],
        'sa-localized': [
          {
            headline: `Let's learn about ${productName} together, hey!`,
            body: `Knowledge is lekker! We're sharing everything you need to know about ${productName} in a way that makes sense. No fancy jargon, just straight talk.`,
            callToAction: 'Check out our local guide'
          }
        ],
        friendly: [
          {
            headline: `Getting to know ${productName} better`,
            body: `We believe in empowering you with knowledge. Here's everything you need to know about ${productName} to make the right choice for you.`,
            callToAction: 'Explore our resources'
          }
        ],
        authoritative: [
          {
            headline: `${productName}: Technical Overview and Applications`,
            body: `Comprehensive analysis of ${productName} capabilities, implementation strategies, and industry applications. Evidence-based insights for informed decision-making.`,
            callToAction: 'Download technical documentation'
          }
        ],
        playful: [
          {
            headline: `🎓 ${productName} 101: Fun Facts & Cool Stuff!`,
            body: `Ready for some mind-blowing facts about ${productName}? We're about to drop some serious knowledge bombs that'll make you the smartest person in the room! 🤓💡`,
            callToAction: 'Become a ${productName} expert! 🏆'
          }
        ]
      },
      community: [
        {
          headline: `Join the ${productName} Community`,
          body: `Connect with like-minded individuals who share your passion. Our community is built on shared experiences, mutual support, and collective growth.`,
          callToAction: 'Become part of our community'
        }
      ]
    };

    // Get templates for the specific goal and tone
    const goalTemplates = templates[goal as keyof typeof templates];
    if (!goalTemplates) {
      // Fallback to a generic template
      return {
        headline: `Discover ${productName}`,
        body: `Experience the difference with ${productName}. Quality, innovation, and value come together in perfect harmony.`,
        callToAction: 'Learn more today'
      };
    }

    let toneTemplates;
    if (Array.isArray(goalTemplates)) {
      toneTemplates = goalTemplates;
    } else {
      toneTemplates = goalTemplates[tone as keyof typeof goalTemplates] || goalTemplates['professional'] || goalTemplates['conversational'];
    }

    if (!toneTemplates || !Array.isArray(toneTemplates)) {
      // Fallback template
      return {
        headline: `Discover ${productName}`,
        body: `Experience the difference with ${productName}. Quality, innovation, and value come together in perfect harmony.`,
        callToAction: 'Learn more today'
      };
    }

    // Randomly select from available templates for variety
    const randomIndex = Math.floor(Math.random() * toneTemplates.length);
    return toneTemplates[randomIndex];
  }

  isAIEnabled(): boolean {
    return this.isConfigured;
  }

  getProviderInfo(): { provider: string; model: string; status: string } {
    if (this.isConfigured) {
      return {
        provider: 'OpenAI',
        model: 'GPT-3.5 Turbo',
        status: 'Connected'
      };
    }
    return {
      provider: 'Template System',
      model: 'Enhanced Templates',
      status: 'Fallback Mode'
    };
  }
}

export const aiService = new AIService();