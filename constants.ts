import { Theme } from './types';

export const FLOWER_THEMES: Theme[] = [
    { name: "Rose Quartz", primary: "#e91e63", bgLight: "#ffe4ec", bgDark: "#330b15", textLight: "#880e4f", textDark: "#fce4ec" },
    { name: "Lavender Mist", primary: "#9c27b0", bgLight: "#f3e5f5", bgDark: "#2a0b33", textLight: "#4a148c", textDark: "#f3e5f5" },
    { name: "Sunflower Glow", primary: "#fbc02d", bgLight: "#fff8e1", bgDark: "#33260b", textLight: "#f57f17", textDark: "#fffde7" },
    { name: "Cherry Blossom", primary: "#ec407a", bgLight: "#fde2ea", bgDark: "#330e19", textLight: "#880e4f", textDark: "#fce4ec" },
    { name: "Orchid Bloom", primary: "#ab47bc", bgLight: "#f4e1f7", bgDark: "#2a0b33", textLight: "#4a148c", textDark: "#e1bee7" },
    { name: "Peony Pink", primary: "#f06292", bgLight: "#fde1ee", bgDark: "#33101f", textLight: "#880e4f", textDark: "#f8bbd0" },
    { name: "Iris Indigo", primary: "#3f51b5", bgLight: "#e8eaf6", bgDark: "#0e1133", textLight: "#1a237e", textDark: "#c5cae9" },
    { name: "Marigold", primary: "#ffa000", bgLight: "#fff3e0", bgDark: "#332100", textLight: "#e65100", textDark: "#ffe0b2" },
    { name: "Lotus", primary: "#8e24aa", bgLight: "#f5e1ff", bgDark: "#220833", textLight: "#4a148c", textDark: "#e1bee7" },
    { name: "Camellia", primary: "#d81b60", bgLight: "#fde1ea", bgDark: "#330515", textLight: "#880e4f", textDark: "#f8bbd0" },
    { name: "Jasmine", primary: "#43a047", bgLight: "#e8f5e9", bgDark: "#0c330e", textLight: "#1b5e20", textDark: "#c8e6c9" },
    { name: "Tulip Red", primary: "#e53935", bgLight: "#ffebee", bgDark: "#330e0e", textLight: "#b71c1c", textDark: "#ffcdd2" },
    { name: "Dahlia Plum", primary: "#6a1b9a", bgLight: "#ede7f6", bgDark: "#1a0633", textLight: "#311b92", textDark: "#d1c4e9" },
    { name: "Gardenia", primary: "#009688", bgLight: "#e0f2f1", bgDark: "#002622", textLight: "#004d40", textDark: "#b2dfdb" },
    { name: "Hydrangea", primary: "#5c6bc0", bgLight: "#e3e8fd", bgDark: "#111533", textLight: "#1a237e", textDark: "#c5cae9" },
    { name: "Lavatera", primary: "#7b1fa2", bgLight: "#f2e5ff", bgDark: "#1e0633", textLight: "#4a148c", textDark: "#e1bee7" },
    { name: "Primrose", primary: "#f57c00", bgLight: "#fff3e0", bgDark: "#331a00", textLight: "#e65100", textDark: "#ffe0b2" },
    { name: "Bluebell", primary: "#1e88e5", bgLight: "#e3f2fd", bgDark: "#051e33", textLight: "#0d47a1", textDark: "#bbdefb" },
    { name: "Magnolia", primary: "#8d6e63", bgLight: "#efebe9", bgDark: "#261d1b", textLight: "#3e2723", textDark: "#d7ccc8" },
    { name: "Wisteria", primary: "#7e57c2", bgLight: "#ede7f6", bgDark: "#1a1233", textLight: "#311b92", textDark: "#d1c4e9" },
];

export const LOCALIZATION = {
    en: {
        title: "FDA Document Intelligence Workbench",
        subtitle: "Advanced Document Analysis & Multi-Agent Processing System",
        upload: "Upload Documents",
        paste: "Paste Text Content",
        docs: "Documents",
        ocr: "OCR Processing",
        wordgraph: "Word Graph Analysis",
        smartnote: "Smart Note",
        qna: "Ask AI",
        settings: "Settings",
        theme: "Visual Style",
        select_style: "Use Magic Wheel to select style",
        generate: "Run OCR",
        processing: "Processing...",
        no_key: "Please enter your Gemini API Key in settings.",
        transform: "Transform to Smart Note",
        analyzing: "Analyzing...",
        entities: "Extracted Entities",
        mindgraph: "Mind Graph",
        formatted: "Formatted Note",
        questions: "Follow-up Questions",
        preview: "Preview",
        ask_placeholder: "Ask a question about your documents...",
        send: "Send",
        model: "Model",
        max_tokens: "Max Tokens",
        markdown_view: "Markdown View",
        raw_view: "Raw Text",
        ask_title: "Document Q&A",
        ask_subtitle: "Query your documents with custom parameters",
        ocr_settings: "OCR Settings",
        agent_analysis: "Agent Analysis",
        run_analysis: "Run Analysis",
        edit_result: "Edit Result",
        agent_prompt: "Agent Prompt",
        ocr_placeholder: "OCR text will appear here. Select a document and run OCR.",
        analysis_placeholder: "Agent analysis results will appear here."
    },
    "zh-TW": {
        title: "FDA 文件智能工作台",
        subtitle: "進階文件分析與多代理處理系統",
        upload: "上傳文件",
        paste: "貼上文字內容",
        docs: "文件",
        ocr: "OCR 處理",
        wordgraph: "詞彙圖分析",
        smartnote: "智能筆記",
        qna: "AI 問答",
        settings: "設定",
        theme: "視覺風格",
        select_style: "使用魔法輪盤選擇風格",
        generate: "執行 OCR",
        processing: "處理中...",
        no_key: "請在設定中輸入 Gemini API 金鑰。",
        transform: "轉換為智能筆記",
        analyzing: "分析中...",
        entities: "擷取實體",
        mindgraph: "思維圖",
        formatted: "格式化筆記",
        questions: "後續問題",
        preview: "預覽",
        ask_placeholder: "關於文件提出問題...",
        send: "發送",
        model: "模型",
        max_tokens: "最大 Token",
        markdown_view: "Markdown 檢視",
        raw_view: "純文字",
        ask_title: "文件問答",
        ask_subtitle: "使用自訂參數查詢您的文件",
        ocr_settings: "OCR 設定",
        agent_analysis: "代理分析",
        run_analysis: "執行分析",
        edit_result: "編輯結果",
        agent_prompt: "代理提示詞",
        ocr_placeholder: "OCR 文字將顯示於此。請選擇文件並執行 OCR。",
        analysis_placeholder: "代理分析結果將顯示於此。"
    }
};

export const PROMPTS = {
    ocr: `You are a precise OCR transcription expert. Transcribe the text from the image word-for-word, including punctuation.
    - If there are tables, output them as Markdown tables.
    - Do not describe the image, only output the text found within it.
    - Language: Detect automatically (English or Traditional Chinese).`,
    
    smartNote: `You are an expert FDA regulatory document analyst. Analyze the following text and return a JSON object with the following structure:
    {
        "formattedText": "Clean, well-structured Markdown version of the text with headers, bullets, etc.",
        "entities": "A Markdown table with columns: #, Entity, Context/Description. Extract top 20 key entities (Drugs, Organizations, Dates, Regulations).",
        "mindGraph": {
            "nodes": [{"id": "Concept1", "label": "Concept 1", "val": 10}, ...],
            "links": [{"source": "Concept1", "target": "Concept2", "value": 5}, ...]
        },
        "keywords": ["Key1", "Key2", "Key3", ...],
        "questions": "A list of 20 deep, exploratory follow-up questions based on the text."
    }
    
    Ensure the JSON is valid. For the mindGraph, extract 10-15 core concepts and their relationships. 'val' in nodes represents importance (5-20), 'value' in links represents strength (1-10).
    `,

    agentAnalysis: `Please analyze the provided text.
1. Create a concise summary of the document.
2. Extract the top 20 most important entities (such as Drugs, Companies, Regulations, Dates, Medical Terms).
3. Present these entities in a Markdown table with the following columns: Entity, Type, Context/Description.

Ensure the output is in clean Markdown format.
`
};