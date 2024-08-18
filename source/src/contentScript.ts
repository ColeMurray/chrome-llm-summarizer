import browser from "webextension-polyfill";
import { marked } from "marked";
import "./css/app.css";
import "./css/markdown.css";

let modalRoot: HTMLElement | null = null;

browser.runtime.onMessage.addListener((request, sender) => {
    console.log("Content script received message:", request);
    if (request.action === "summarize") {
        browser.storage.sync.get(["openaiApiKey"]).then((result) => {
            if (result.openaiApiKey) {
                browser.runtime.sendMessage({
                    action: "summarize",
                    text: request.text,
                    apiKey: result.openaiApiKey,
                });
            } else {
                alert(
                    "Please set your OpenAI API key in the extension options.",
                );
            }
        });
    } else if (
        request.action === "displaySummary" ||
        request.action === "updateSummary"
    ) {
        renderModal(request.summary);
    } else if (request.action === "displayError") {
        renderModal(request.error, true);
    }
});

function renderModal(content: string, isError = false) {
    console.log("Rendering modal with content:", content);
    if (!modalRoot) {
        modalRoot = document.createElement("div");
        modalRoot.id = "summary-modal-root";
        document.body.appendChild(modalRoot);
    }

    // Render Markdown to HTML
    const renderedContent = isError ? content : marked(content);

    modalRoot.innerHTML = `
    <div class="fixed top-5 right-5 w-96 max-h-[80vh] bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-[9999]" id="summary-modal">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-2 ${
            isError ? "text-red-600" : "text-gray-800"
        }">
          ${isError ? "Error" : "Summary"}
        </h2>
        <div class="text-sm text-gray-600 mb-4 overflow-y-auto max-h-[calc(80vh-8rem)] markdown-body">
          ${renderedContent}
        </div>
        <button
          id="copy-button"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  `;

    document.getElementById("copy-button")?.addEventListener("click", () => {
        navigator.clipboard.writeText(content);
    });

    document.addEventListener("mousedown", handleClickOutside);
}

function handleClickOutside(event: MouseEvent) {
    if (modalRoot && !modalRoot.contains(event.target as Node)) {
        document.body.removeChild(modalRoot);
        modalRoot = null;
        document.removeEventListener("mousedown", handleClickOutside);
    }
}
