import React, { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export const Popup: React.FC = () => {
    const [apiKey, setApiKey] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");

    useEffect(() => {
        browser.storage.sync
            .get(["openaiApiKey", "systemPrompt"])
            .then((result) => {
                if (result.openaiApiKey) {
                    setApiKey(result.openaiApiKey);
                }
                if (result.systemPrompt) {
                    setSystemPrompt(result.systemPrompt);
                } else {
                    // Set default prompt if not found in storage
                    setSystemPrompt(
                        "You are a helpful assistant that summarizes text. Provide your responses in chinese mandarin and provide proper headings and formatting. You provide high quality, concise and well formatted summaries.",
                    );
                }
            });
    }, []);

    const handleSave = () => {
        browser.storage.sync
            .set({
                openaiApiKey: apiKey,
                systemPrompt: systemPrompt,
            })
            .then(() => {
                alert("Settings saved!");
            });
    };

    return (
        <div id={"summary-modal-root"}>
            <div className="w-80 p-4 space-y-4">
                <h2 className="text-xl font-bold">Text Summarizer Options</h2>
                <div className="space-y-2">
                    <label htmlFor="api-key" className="text-sm font-medium">
                        OpenAI API Key
                    </label>
                    <Input
                        id="api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your OpenAI API key"
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="system-prompt"
                        className="text-sm font-medium"
                    >
                        System Prompt
                    </label>
                    <Textarea
                        id="system-prompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Enter system prompt"
                        rows={4}
                    />
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
                    Save Settings
                </Button>
            </div>
        </div>
    );
};
