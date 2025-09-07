import { GoogleGenAI, Type } from "@google/genai";
import { marked } from 'marked';
import { City, ComparisonDataPoint, SubTopic, CityStat, SurveyAnswers, CityRecommendation, UniversityFilters, UniversityProgram } from '../types';

const API_KEY = process.env.API_KEY as string;
let ai: GoogleGenAI | null = null;

if (!API_KEY) {
    console.error("FATAL: Google AI API Key (API_KEY) is not set in the environment. AI features will fail.");
} else {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (error) {
        console.error("Error initializing GoogleGenAI:", error);
    }
}

function getAiInstance() {
    if (!ai) {
        throw new Error("Google AI client is not initialized. Make sure the API_KEY is set correctly in your environment.");
    }
    return ai;
}


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
        const localAi = getAiInstance();
        const response = await localAi.models.generateContent({
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
        const localAi = getAiInstance();
        const response = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        // Ensure the response matches the sub-topic names we requested for consistency
        const validatedData = subTopics.map(st => {
            const found = parsedData.find((item: any) => item.subTopic === st.name);
            if (found) {
                return {
                    subTopic: st.name,
                    rating: found.rating,
                    summary: found.summary
                };
            }
            // If the AI didn't return a specific sub-topic, provide a default
            return {
                subTopic: st.name,
                rating: 0,
                summary: 'Veri alınamadı.'
            };
        });

        return validatedData;

    } catch (error) {
        console.error(`Error fetching structured comparison for ${city.name}:`, error);
        throw new Error(`Failed to get comparison data for ${city.name}.`);
    }
};


/**
 * Fetches a short, updated introduction for each city.
 * @param cities - The initial array of city objects.
 * @returns An updated array of city objects with new descriptions.
 */
export const fetchAllCityIntros = async (cities: City[]): Promise<City[]> => {
    const prompt = `
        For each of the following Italian cities, provide a very brief, one-sentence description (in Turkish, max 15 words) for a Turkish student planning to study there. The tone should be catchy and informative.
        
        Cities: ${cities.map(c => c.name).join(', ')}
        
        Return the data ONLY in the specified JSON format. Do not include any other text or markdown formatting. The 'id' must be the lowercase, url-friendly version of the city name.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING }
            },
            required: ["id", "description"]
        }
    };
    
    try {
        const localAi = getAiInstance();
        const response = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonStr = response.text.trim();
        const descriptions: { id: string, description: string }[] = JSON.parse(jsonStr);

        // Map the new descriptions back to the original cities array
        const updatedCities = cities.map(city => {
            const newDesc = descriptions.find(d => d.id === city.id);
            return newDesc ? { ...city, description: newDesc.description } : city;
        });

        return updatedCities;
    } catch (error) {
        console.error("Error fetching all city intros:", error);
        // On failure, return the original cities array to prevent app crash
        return cities;
    }
};

/**
 * Fetches personalized city recommendations based on survey answers.
 * @param answers - The user's answers from the survey.
 * @param cities - The list of available cities.
 * @returns An array of CityRecommendation objects.
 */
export const fetchSurveyRecommendations = async (answers: SurveyAnswers, cities: City[]): Promise<CityRecommendation[]> => {
    const cityList = cities.map(c => `${c.name} (ID: ${c.id})`).join(', ');

    const prompt = `
        A Turkish student has answered a survey about their preferences for studying in Italy. Based on their answers, recommend the top 3 most suitable cities from the provided list.
        
        Student's Preferences:
        - Monthly Budget: ${answers.budget} (${answers.budget === 'low' ? 'Ekonomik' : answers.budget === 'medium' ? 'Orta' : 'Geniş'})
        - Preferred City Life: ${answers.cityLife} (${answers.cityLife === 'calm' ? 'Sakin ve tarihi' : answers.cityLife === 'balanced' ? 'Dengeli kültürel hayat' : 'Hareketli ve modern'})
        - Field of Study: ${answers.fieldOfStudy} (${answers.fieldOfStudy === 'art' ? 'Sanat & Tasarım' : answers.fieldOfStudy === 'tech' ? 'Mühendislik & Teknoloji' : answers.fieldOfStudy === 'social' ? 'Sosyal Bilimler' : 'Tıp & Sağlık'})
        
        Available Cities: ${cityList}
        
        For each of the top 3 cities, provide:
        1. "cityId": The exact ID of the city (e.g., 'milan').
        2. "reason": A short, personalized reason (in Turkish, max 20 words) explaining why this city is a good match for the student.
        
        Return the data ONLY in the specified JSON format. Do not include any other text.
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
        const localAi = getAiInstance();
        const response = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonStr = response.text.trim();
        const recommendations: CityRecommendation[] = JSON.parse(jsonStr);

        return recommendations;
    } catch (error) {
        console.error("Error fetching survey recommendations:", error);
        throw new Error("Failed to get survey recommendations.");
    }
};

/**
 * Fetches key statistics for a city for the overview panel.
 * @param city - The city to get stats for.
 * @returns An array of CityStat objects.
 */
export const fetchCityStats = async (city: City): Promise<CityStat[]> => {
    const prompt = `
        Provide a summary for a Turkish student about ${city.name}, Italy, focusing on these three key metrics: "Yaşam Maliyeti" (Cost of Living), "Üniversite Kalitesi" (University Quality), and "Güvenlik" (Safety).
        
        For each metric, provide:
        1. "metric": The exact name of the metric in Turkish.
        2. "value": A score from 0 to 100 representing the city's performance from a student's perspective. For 'Yaşam Maliyeti', a higher score means it's MORE affordable (cheaper).
        3. "summary": A very brief (1-2 sentences, in Turkish) explanation of the score.
        
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
        const localAi = getAiInstance();
        const response = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonStr = response.text.trim();
        const stats: CityStat[] = JSON.parse(jsonStr);

        return stats;
    } catch (error) {
        console.error(`Error fetching stats for ${city.name}:`, error);
        throw new Error(`Failed to get stats for ${city.name}.`);
    }
};

/**
 * Fetches a list of university programs based on user filters.
 * @param filters - The filters selected by the user.
 * @returns A list of matching university programs.
 */
export const fetchUniversities = async (filters: UniversityFilters): Promise<UniversityProgram[]> => {
    const prompt = `
        You are an academic advisor for Turkish students. Find university programs in Italy that match the following criteria. Return a list of up to 10 relevant programs.
        
        Criteria:
        - Field of Study: ${filters.fieldOfStudy === 'any' ? 'Any' : filters.fieldOfStudy}
        - Language of Instruction: ${filters.language === 'any' ? 'Any' : filters.language}
        - Maximum Annual Tuition Fee: €${filters.tuitionMax}
        
        For each program found, provide the following details:
        - universityName
        - programName
        - city
        - language: Must be 'English', 'Italian', or 'Mixed'.
        - annualFee: An estimated integer value.
        - description: A brief, enticing summary for a student (in Turkish, 1-2 sentences).
        - websiteUrl: A valid, direct URL to the program or university page.
        
        Return the data ONLY in the specified JSON format. Do not include any other text.
    `;
    
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                universityName: { type: Type.STRING },
                programName: { type: Type.STRING },
                city: { type: Type.STRING },
                language: { type: Type.STRING },
                annualFee: { type: Type.INTEGER },
                description: { type: Type.STRING },
                websiteUrl: { type: Type.STRING }
            },
            required: ["universityName", "programName", "city", "language", "annualFee", "description", "websiteUrl"]
        }
    };
    
    try {
        const localAi = getAiInstance();
        const response = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                tools: [{ googleSearch: {} }] // Use search for up-to-date program info
            },
        });
        
        const jsonStr = response.text.trim();
        const programs: UniversityProgram[] = JSON.parse(jsonStr);

        return programs;
    } catch (error) {
        console.error("Error fetching universities:", error);
        throw new Error("Failed to fetch university programs.");
    }
};
