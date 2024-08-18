import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
        id: "summarizeText",
        title: "Summarize",
        contexts: ["selection"],
    });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;
    if (info.menuItemId === "summarizeText") {
        browser.tabs.sendMessage(tab.id, {
            action: "summarize",
            text: info.selectionText,
        });
    }
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background script received message:", request);

    if (request.action === "summarize" && sender.tab?.id) {
        browser.storage.sync
            .get(["openaiApiKey", "systemPrompt"])
            .then((result) => {
                const apiKey = result.openaiApiKey;
                const systemPrompt =
                    result.systemPrompt ||
                    "You are a helpful assistant that summarizes text. You provide high quality, concise and well formatted summaries.";

                summarizeText(request.text, apiKey, systemPrompt, sender.tab.id)
                    .then((summary) => {
                        browser.tabs.sendMessage(sender.tab.id, {
                            action: "displaySummary",
                            summary,
                        });
                    })
                    .catch((error) => {
                        browser.tabs.sendMessage(sender.tab.id, {
                            action: "displayError",
                            error: error.message,
                        });
                    });
            });
    }
});

async function summarizeText(
    text: string,
    apiKey: string,
    systemPrompt: string,
    tabId: number,
): Promise<string> {
    console.debug("Summarizing text:", text);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `${text}`,
                },
            ],
            stream: true,
        }),
    });

    const reader = response.body!.getReader();
    let summary = "";
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6); // Remove "data: " prefix
                if (jsonStr === "[DONE]") continue;

                try {
                    const parsedData = JSON.parse(jsonStr);
                    const content = parsedData.choices[0]?.delta?.content || "";
                    if (content) {
                        summary += content;
                        browser.tabs.sendMessage(tabId, {
                            action: "updateSummary",
                            summary,
                        });
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    console.log("Problematic JSON string:", jsonStr);
                }
            }
        }
    }

    return summary;
}
