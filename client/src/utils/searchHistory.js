const STORAGE_KEY = "waverly_search_history";
const MAX_HISTORY = 10;

export const getSearchHistory = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse search history", e);
        return [];
    }
};

export const saveSearchQuery = (query) => {
    const trimmed = (query || "").trim();
    if (!trimmed) return;
    try {
        const history = getSearchHistory();
        const filtered = history.filter(
            (item) => item.toLowerCase() !== trimmed.toLowerCase()
        );
        const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("search_history_updated", { detail: updated }));
    } catch (e) {
        console.error("Failed to save search history", e);
    }
};

export const removeSearchQuery = (query) => {
    const trimmed = (query || "").trim();
    if (!trimmed) return;
    try {
        const history = getSearchHistory();
        const updated = history.filter(
            (item) => item.toLowerCase() !== trimmed.toLowerCase()
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("search_history_updated", { detail: updated }));
    } catch (e) {
        console.error("Failed to remove search history item", e);
    }
};

export const clearSearchHistory = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("search_history_updated", { detail: [] }));
    } catch (e) {
        console.error("Failed to clear search history", e);
    }
};
