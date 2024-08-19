import React, { useState, useEffect, useRef } from "react";
import browser from "webextension-polyfill";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const models = ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-4o-2024-08-06"];

export const Popup: React.FC = () => {
    const [apiKey, setApiKey] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [selectedModel, setSelectedModel] = useState("gpt-4o-2024-08-06");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        browser.storage.sync
            .get(["openaiApiKey", "systemPrompt", "selectedModel"])
            .then((result) => {
                if (result.openaiApiKey) setApiKey(result.openaiApiKey);
                if (result.systemPrompt) {
                    setSystemPrompt(result.systemPrompt);
                } else {
                    setSystemPrompt(
                        "You are a helpful assistant that summarizes text. You provide high quality, concise and well formatted summaries.",
                    );
                }
                if (result.selectedModel)
                    setSelectedModel(result.selectedModel);
            });

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSave = () => {
        browser.storage.sync
            .set({
                openaiApiKey: apiKey,
                systemPrompt: systemPrompt,
                selectedModel: selectedModel,
            })
            .then(() => {
                alert("Settings saved!");
            });
    };

    return (
        <div id="summary-modal-root">
            <div className="w-[300px] p-4 space-y-3 bg-white">
                <h2 className="text-lg font-bold mb-3">
                    Text Summarizer Options
                </h2>
                <div className="space-y-2">
                    <label
                        htmlFor="api-key"
                        className="text-sm font-medium block"
                    >
                        OpenAI API Key
                    </label>
                    <Input
                        id="api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your OpenAI API key"
                        className="w-full px-2 py-1 text-sm"
                    />
                </div>
                <div className="space-y-2" ref={dropdownRef}>
                    <label
                        htmlFor="model-select"
                        className="text-sm font-medium block"
                    >
                        Model
                    </label>
                    <div className="relative">
                        <button
                            id="model-select"
                            className="w-full px-2 py-1 text-sm text-left bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {selectedModel}
                        </button>
                        {isOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-sm">
                                {models.map((model) => (
                                    <div
                                        key={model}
                                        className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setIsOpen(false);
                                        }}
                                    >
                                        {model}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="system-prompt"
                        className="text-sm font-medium block"
                    >
                        System Prompt
                    </label>
                    <Textarea
                        id="system-prompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Enter system prompt"
                        rows={3}
                        className="w-full px-2 py-1 text-sm resize-none"
                    />
                </div>
                <Button
                    onClick={handleSave}
                    className="w-full bg-blue-500 text-white py-1 px-2 text-sm rounded hover:bg-blue-600 transition duration-200"
                >
                    Save Settings
                </Button>
            </div>
        </div>
    );
};
