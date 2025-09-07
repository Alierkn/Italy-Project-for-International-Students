import React from 'react';

export interface City {
  id: string;
  name: string;
  coords: {
    x: number; // percentage
    y: number; // percentage
  };
  description: string;
  region?: string;
  population?: number;
  imageUrl: string;
}

export interface SubTopic {
  id: string;
  name: string;
}

export interface Topic {
  id:string;
  name: string;
  icon: React.ReactNode;
  subTopics: SubTopic[];
}

// Type for the structured data returned by the AI for the radar chart
export interface ComparisonDataPoint {
  subTopic: string;
  rating: number; // A rating from 1 to 10
  summary: string; // A brief explanation for the rating
}

// Type for the complete comparison result for a single city
export interface CityComparisonResult {
  cityId: string;
  data: ComparisonDataPoint[];
  error?: string;
}

// Type for the structured city statistics for the bar chart
export interface CityStat {
  metric: string;
  value: number; // A value from 0 to 100
  summary: string;
}

// Type for the personalized survey answers
export interface SurveyAnswers {
  budget: 'low' | 'medium' | 'high';
  cityLife: 'calm' | 'balanced' | 'vibrant';
  fieldOfStudy: 'art' | 'tech' | 'social' | 'health';
}

// Type for the AI-generated city recommendations
export interface CityRecommendation {
  cityId: string;
  reason: string;
}

// Types for the new Checklist feature
export interface ChecklistItem {
  id: string;
  text: string;
}

export interface ChecklistStage {
  title: string;
  items: ChecklistItem[];
}

// Types for the new University Finder feature
export interface UniversityFilters {
  fieldOfStudy: 'any' | 'art' | 'tech' | 'social' | 'health';
  language: 'any' | 'english' | 'italian';
  tuitionMax: number; // Max annual tuition in EUR
}

export interface UniversityProgram {
  universityName: string;
  programName: string;
  city: string;
  language: 'English' | 'Italian' | 'Mixed';
  annualFee: number;
  description: string;
  websiteUrl: string;
}

// Type for Chatbot messages
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}