import { GoogleGenAI, Type } from "@google/genai";
import { marked } from 'marked';
import { City, ComparisonDataPoint, SubTopic, CityStat, SurveyAnswers, CityRecommendation, UniversityFilters, UniversityProgram } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface FetchInfoResponse {
    htmlContent: string;
    sources: { web: { uri: string; title: string } }[] | null;
}

/**
 * Fetches information about a city and topic from the Gemini API.
 * @param city - The name of the Italian city.
 * @param topicName - The name of the topic.
 * @param topicId - The ID of the topic, used to enable grounding.
 * @returns An object containing the formatted HTML content and any grounding sources.
 */
export const fetchInfo = async (city: string, topicName: string, topicId: string): Promise<FetchInfoResponse> => {
    const prompt = `
        You are a helpful and knowledgeable guide for Turkish students planning to study in Italy.
        Your audience is young, ambitious, and looking for practical, clear, and encouraging advice.
        Your tone should be friendly, supportive, and highly informative, like a senior student mentoring a new one.
        
        Please provide a detailed guide on the topic of "${topicName}" for a Turkish student who will be studying in ${city}, Italy.
        
        Structure your response in Markdown format. Use headings, subheadings, bullet points, and bold text to make the information easy to digest.
        
        Here is a suggested structure:
        - Start with a catchy and encouraging title.
        - Provide a brief, engaging introduction to the topic in the context of ${city}.
        - Break down the main points into clear sections with headings (e.g., "Finding an Apartment", "Types of Accommodation", "Average Costs").
        - Use bullet points for lists of tips, websites, or steps.
        - Include practical advice, potential challenges, and pro-tips specific to ${city}.
        - Conclude with a summary or a final encouraging remark.
        
        Ensure the information is as up-to-date and accurate as possible.
        The entire response must be in Turkish.
    `;

    const isVisaTopic = topicId === 'visa';

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            ...(isVisaTopic && { config: { tools: [{ googleSearch: {} }] } }),
        });
        
        const rawText = response.text;
        const htmlContent = marked.parse(rawText) as string;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = groundingChunks
            ? groundingChunks
                .filter(chunk => chunk.web?.uri)
                .map(chunk => ({
                    web: {
                        uri: chunk.web!.uri!,
                        title: chunk.web!.title || '',
                    }
                }))
            : null;

        return { htmlContent, sources };

    } catch (error) {
        console.error("Error fetching data from Gemini API:", error);
        throw new Error("Failed to get information from the AI model.");
    }
};

/**
 * Fetches structured comparison data for a city based on selected sub-topics.
 * @param city - The city to get data for.
 * @param mainTopicName - The name of the main topic.
 * @param subTopics - An array of sub-topics to compare.
 * @returns An array of ComparisonDataPoint objects.
 */
export const fetchStructuredComparison = async (
    city: City,
    mainTopicName: string,
    subTopics: SubTopic[]
): Promise<ComparisonDataPoint[]> => {
    
    const subTopicNames = subTopics.map(st => `"${st.name}"`).join(', ');

    const prompt = `
        As an expert consultant for Turkish students studying in Italy, analyze ${city.name} based on the main topic "${mainTopicName}".
        
        Provide a detailed evaluation for the following specific criteria: ${subTopicNames}.
        
        For each criterion, you must provide:
        1. A "rating" on a scale of 1 to 10, where 1 is very poor and 10 is excellent from a student's perspective.
        2. A concise "summary" (in Turkish, max 25-30 words) explaining the reason for your rating.
        
        Return the data ONLY in the specified JSON format. Do not include any other text or markdown formatting.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                subTopic: {
                    type: Type.STRING,
                    description: 'The name of the sub-topic criterion.'
                },
                rating: {
                    type: Type.INTEGER,
                    description: 'The rating from 1 to 10.'
                },
                summary: {
                    type: Type.STRING,
                    description: 'The brief summary in Turkish.'
                }
            },
            required: ["subTopic", "rating", "summary"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        // Ensure the response matches the subtopics we requested
        return subTopics.map(st => {
            const found = parsedJson.find((p: any) => p.subTopic === st.name);
            return found || { subTopic: st.name, rating: 0, summary: 'Veri alınamadı.' };
        });

    } catch (error) {
        console.error(`Error fetching structured data for ${city.name}:`, error);
        throw new Error(`Failed to get structured information for ${city.name}.`);
    }
};


/**
 * Fetches vibrant, introductory descriptions for all cities using the Gemini API.
 * @param cities - The initial array of cities.
 * @returns A new array of cities with AI-generated descriptions.
 */
export const fetchAllCityIntros = async (cities: City[]): Promise<City[]> => {
    try {
        const cityPromises = cities.map(async (city) => {
            const prompt = `
                Write a short, vibrant, and inviting introductory paragraph (around 25-35 words) about the city of ${city.name}, Italy.
                The target audience is a Turkish student considering studying there.
                The tone should be exciting and appealing, highlighting its unique character for a student.
                Respond ONLY with the paragraph itself. No titles, no extra text, no markdown.
                The entire response must be in Turkish.
            `;
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                const newDescription = response.text.trim();
                return { ...city, description: newDescription };
            } catch (error) {
                console.error(`Failed to fetch intro for ${city.name}:`, error);
                return city; // Fallback to original description on error
            }
        });

        return await Promise.all(cityPromises);

    } catch (error) {
        console.error("Error fetching city intros in parallel:", error);
        return cities; // On total failure, return original cities
    }
};

/**
 * Fetches key statistics for a city.
 * @param city - The city to get stats for.
 * @returns An array of CityStat objects.
 */
export const fetchCityStats = async (city: City): Promise<CityStat[]> => {
    const prompt = `
        As an expert consultant for Turkish students studying in Italy, provide key statistics for ${city.name}.
        I need data for the following three metrics:
        1. "Yaşam Maliyeti": How affordable is the city? Rate from 0 to 100, where 100 is very cheap and 0 is very expensive.
        2. "Üniversite Kalitesi": What is the general academic reputation of universities in the city? Rate from 0 to 100, where 100 is excellent.
        3. "Güvenlik": How safe is the city for students? Rate from 0 to 100, where 100 is extremely safe.

        For each metric, provide:
        1. The exact "metric" name as listed above.
        2. A "value" as an integer between 0 and 100.
        3. A very short, one-sentence "summary" in Turkish explaining the value.

        Return the data ONLY in the specified JSON format. Do not include any other text or markdown formatting.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                metric: { type: Type.STRING },
                value: { type: Type.INTEGER },
                summary: { type: Type.STRING }
            },
            required: ["metric", "value", "summary"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CityStat[];
    } catch (error) {
        console.error(`Error fetching stats for ${city.name}:`, error);
        throw new Error(`Failed to get stats for ${city.name}.`);
    }
};


/**
 * Fetches personalized city recommendations based on a user's survey answers.
 * @param answers - The user's answers from the survey.
 * @param cities - The list of available cities to choose from.
 * @returns A promise that resolves to an array of CityRecommendation objects.
 */
export const fetchSurveyRecommendations = async (answers: SurveyAnswers, cities: City[]): Promise<CityRecommendation[]> => {
    const cityList = cities.map(c => `- ${c.name} (id: ${c.id})`).join('\n');
    const prompt = `
        You are an expert student counselor for Turkish students planning to study in Italy.
        A student has provided their preferences through a survey. Your task is to recommend the top 3 most suitable cities from the provided list.

        Student's Preferences:
        - Monthly Budget: ${answers.budget === 'low' ? '€500-€700' : answers.budget === 'medium' ? '€700-€1000' : '€1000+'}
        - Desired City Life: ${answers.cityLife === 'calm' ? 'Calm and Historic' : answers.cityLife === 'balanced' ? 'Balanced and Cultural' : 'Vibrant and Modern'}
        - Field of Study: ${answers.fieldOfStudy === 'art' ? 'Art & Design' : answers.fieldOfStudy === 'tech' ? 'Engineering & Technology' : answers.fieldOfStudy === 'social' ? 'Social Sciences' : 'Medicine & Health'}

        Available Cities:
        ${cityList}

        Based on these preferences, analyze the available cities and select the top 3. For each recommended city, provide its exact 'cityId' and a concise 'reason' (in Turkish, max 20-25 words) explaining why it's a great match for the student.

        Return the data ONLY in the specified JSON format. Do not include any other text, markdown, or explanations. The response should be an array of 3 objects.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                cityId: { type: Type.STRING },
                reason: { type: Type.STRING }
            },
            required: ["cityId", "reason"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CityRecommendation[];
    } catch (error) {
        console.error("Error fetching survey recommendations:", error);
        throw new Error("Failed to get recommendations from the AI model.");
    }
};

/**
 * Fetches university programs from the Gemini API based on user-defined filters.
 * @param filters - The filter criteria for the search.
 * @returns A promise that resolves to an array of UniversityProgram objects.
 */
export const fetchUniversities = async (filters: UniversityFilters): Promise<UniversityProgram[]> => {
    const prompt = `
        You are an expert on higher education in Italy, tasked with helping a Turkish student find university programs.
        The user has provided the following search criteria:
        - Field of Study: ${filters.fieldOfStudy === 'any' ? 'Any' : filters.fieldOfStudy}
        - Language of Instruction: ${filters.language === 'any' ? 'Any' : filters.language}
        - Maximum Annual Tuition Fee: €${filters.tuitionMax}

        Based on these criteria, search for relevant Bachelor's or Master's degree programs in Italy.
        For each program you find (limit to a maximum of 15 relevant results), provide the following details:
        1.  **universityName**: The full name of the university.
        2.  **programName**: The name of the specific degree program.
        3.  **city**: The city where the university is located.
        4.  **language**: The primary language of instruction ('English', 'Italian', or 'Mixed').
        5.  **annualFee**: The estimated annual tuition fee in Euros as a number. If it's a range, provide an average.
        6.  **description**: A brief, one-sentence description in Turkish of what makes the program notable.
        7.  **websiteUrl**: The direct, full URL to the official university or program page. Ensure it is a valid, clickable URL.

        Return the data ONLY in the specified JSON format as an array of objects. Do not include any other text, markdown, or explanations.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                universityName: { type: Type.STRING },
                programName: { type: Type.STRING },
                city: { type: Type.STRING },
                language: { type: Type.STRING, enum: ['English', 'Italian', 'Mixed'] },
                annualFee: { type: Type.INTEGER },
                description: { type: Type.STRING },
                websiteUrl: { type: Type.STRING }
            },
            required: ["universityName", "programName", "city", "language", "annualFee", "description", "websiteUrl"]
        }
    };
    
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as UniversityProgram[];
    } catch (error) {
        console.error("Error fetching university programs:", error);
        throw new Error("Failed to get university programs from the AI model.");
    }
};