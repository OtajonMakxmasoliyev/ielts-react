// src/store/questionStore.ts
import { create } from "zustand";
import axios from "../service/axios";

export interface IQuestion {
    _id?: string;
    title: string;
    slug?: string;
    type: "multiple_choice" | "essay" | "fill_blank" | "listening" | "speaking" | "matching";
    bodyMarkdown: string;
    choices?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
    attachments?: { url: string; type: string }[];
    createdBy?: string;
    tags?: string[];
    published: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface QuestionState {
    questions: IQuestion[];
    loading: boolean;
    error: string | null;

    fetchQuestions: () => Promise<void>;
    addQuestion: (q: IQuestion) => Promise<void>;
    updateQuestion: (id: string, updated: Partial<IQuestion>) => Promise<void>;
    deleteQuestion: (id: string) => Promise<void>;
}


interface ErrorMessage {
    message: string
}
const API_URL = "/questions"

export const useQuestionStore = create<QuestionState>((set, get) => ({
    questions: [],
    loading: false,
    error: null,

    fetchQuestions: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post<IQuestion[]>(API_URL + "/list");
            set({ questions: res.data, loading: false });
        } catch (err: unknown) {
            const error = err as ErrorMessage
            set({ error: error.message, loading: false });
        }
    },

    addQuestion: async (q) => {
        try {
            const res = await axios.post<IQuestion>(API_URL + "/create", q);
            set({ questions: [...get().questions, res.data] });
        } catch (err: unknown) {
            const error = err as ErrorMessage
            set({ error: error.message, loading: false });
        }
    },

    updateQuestion: async (id, updated) => {
        try {
            const res = await axios.post<IQuestion>(`${API_URL + "/update"}/${id}`, updated);
            set({
                questions: get().questions.map((q) => (q._id === id ? res.data : q)),
            });
        } catch (err: unknown) {
            const error = err as ErrorMessage
            set({ error: error.message, loading: false });
        }
    },

    deleteQuestion: async (id) => {
        try {
            await axios.post(`${API_URL}/${id}`);
            set({ questions: get().questions.filter((q) => q._id !== id) });
        } catch (err: unknown) {
            const error = err as ErrorMessage
            set({ error: error.message, loading: false });
        }
    },
}));
