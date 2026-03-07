/**
 * @file i18n.ts
 * @description Internationalization (i18n) system with dynamic locale file loading
 * @version 2.6.0
 *
 * === FEATURES ===
 * - Automatic language detection from multiple sources (URL, localStorage, HTML, browser)
 * - Dynamic translation file loading (namespaced JSON)
 * - Translation caching for performance
 * - Variable replacement in translation strings
 * - Language selector UI support
 * - URL query parameter support for bookmarking
 * - localStorage persistence
 *
 * === LANGUAGE DETECTION PRIORITY ===
 * 1. URL parameter (?lang=de)
 * 2. localStorage
 * 3. HTML lang attribute (<html lang="de">)
 * 4. Browser language (navigator.language)
 * 5. Default language (en)
 *
 * === SUPPORTED LANGUAGES ===
 * - en: English
 * - de: Deutsch
 *
 * === FOLDER STRUCTURE ===
 *
 * src/locales/
 * ├── en/
 * │   ├── common.json
 * │   ├── home.json
 * │   ├── shipper.json
 * │   ├── carrier.json
 * │   ├── faq.json
 * │   ├── about.json
 * │   ├── footer.json
 * │   ├── get-started.json
 * │   ├── corridor.json
 * │   ├── privacy.json
 * │   ├── cookies.json
 * │   ├── terms.json
 * │   ├── imprint.json
 * │   ├── investor.json
 * │   ├── careers.json
 * │   ├── jobs.json
 * │   ├── apply.json
 * │   └── capital.json
 * └── de/
 *     ├── common.json
 *     ├── home.json
 *     ├── shipper.json
 *     ├── carrier.json
 *     ├── faq.json
 *     ├── about.json
 *     ├── footer.json
 *     ├── get-started.json
 *     ├── corridor.json
 *     ├── privacy.json
 *     ├── cookies.json
 *     ├── terms.json
 *     ├── imprint.json
 *     ├── investor.json
 *     ├── careers.json
 *     ├── jobs.json
 *     ├── apply.json
 *     └── capital.json
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Supported locale codes
 */
type LocaleCode = "en" | "de";

/**
 * Translation namespaces
 */
type Namespace =
  | "common"
  | "home"
  | "shipper"
  | "carrier"
  | "faq"
  | "about"
  | "footer"
  | "get-started"
  | "corridor"
  | "privacy"
  | "cookies"
  | "terms"
  | "imprint"
  | "investor"
  | "careers"
  | "jobs"
  | "capital"
  | "apply";

/**
 * Source of language detection
 */
type LanguageSource =
  | "url"
  | "localStorage"
  | "html"
  | "browser"
  | "default"
  | "manual";

/**
 * Translation object structure (can be nested)
 */
interface TranslationObject {
  [key: string]: string | string[] | TranslationObject;
}

/**
 * Collection of translations organized by namespace
 */
interface NamespacedTranslations {
  [namespace: string]: TranslationObject;
}

// ============================================================================
// Configuration
// ============================================================================

const availableLocales: LocaleCode[] = ["en", "de"];

const localeNames: Record<LocaleCode, string> = {
  en: "English",
  de: "Deutsch",
};

const translationNamespaces: Namespace[] = [
  "common",
  "home",
  "shipper",
  "carrier",
  "faq",
  "about",
  "footer",
  "get-started",
  "corridor",
  "privacy",
  "cookies",
  "terms",
  "imprint",
  "investor",
  "careers",
  "jobs",
  "apply",
  "capital",
];

const defaultLanguage: LocaleCode = "en";

const translationCache: Map<LocaleCode, NamespacedTranslations> = new Map();

const STORAGE_KEY = "preferred_language";

// ============================================================================
// Language Detection
// ============================================================================

/**
 * Detects the appropriate language based on multiple sources
 */
function detectLanguage(): { language: LocaleCode; source: LanguageSource } {
  // Priority 1: URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const langFromUrl = urlParams.get("lang") as LocaleCode | null;
  if (langFromUrl && availableLocales.includes(langFromUrl)) {
    return { language: langFromUrl, source: "url" };
  }

  // Priority 2: localStorage
  const langFromStorage = localStorage.getItem(
    STORAGE_KEY,
  ) as LocaleCode | null;
  if (langFromStorage && availableLocales.includes(langFromStorage)) {
    return { language: langFromStorage, source: "localStorage" };
  }

  // Priority 3: HTML lang attribute
  const htmlElement = document.documentElement;
  const langFromHtml = htmlElement.getAttribute("lang");
  if (langFromHtml) {
    const normalizedLang = langFromHtml
      .substring(0, 2)
      .toLowerCase() as LocaleCode;
    if (availableLocales.includes(normalizedLang)) {
      return { language: normalizedLang, source: "html" };
    }
  }

  // Priority 4: Browser language
  const browserLang = (
    (window.navigator as Navigator & { userLanguage?: string }).userLanguage ||
    window.navigator.language
  )
    .substring(0, 2)
    .toLowerCase() as LocaleCode;

  if (availableLocales.includes(browserLang)) {
    return { language: browserLang, source: "browser" };
  }

  // Priority 5: Default
  return { language: defaultLanguage, source: "default" };
}

const detectedLanguage = detectLanguage();
let pageLanguage: LocaleCode = detectedLanguage.language;
let languageSource: LanguageSource = detectedLanguage.source;

// ============================================================================
// URL & Storage Management
// ============================================================================

/**
 * Updates the URL with the current language without page reload
 */
function updateUrlLanguage(language: LocaleCode): void {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Saves language preference to localStorage for persistence
 */
function saveLanguagePreference(language: LocaleCode): void {
  localStorage.setItem(STORAGE_KEY, language);
}

/**
 * Removes language from URL and localStorage
 * Reverts to automatic language detection
 */
function clearLanguagePreference(): void {
  localStorage.removeItem(STORAGE_KEY);
  const url = new URL(window.location.href);
  url.searchParams.delete("lang");
  window.history.replaceState({}, "", url.toString());
}

// ============================================================================
// Dynamic Import Map for JSON Files
// ============================================================================

const localeImportMap: Record<
  LocaleCode,
  Record<Namespace, () => Promise<{ default: unknown }>>
> = {
  en: {
    common: () => import("@locales/en/common.json"),
    home: () => import("@locales/en/home.json"),
    shipper: () => import("@locales/en/shipper.json"),
    carrier: () => import("@locales/en/carrier.json"),
    faq: () => import("@locales/en/faq.json"),
    about: () => import("@locales/en/about.json"),
    footer: () => import("@locales/en/footer.json"),
    "get-started": () => import("@locales/en/get-started.json"),
    corridor: () => import("@locales/en/corridor.json"),
    privacy: () => import("@locales/en/privacy.json"),
    cookies: () => import("@locales/en/cookies.json"),
    terms: () => import("@locales/en/terms.json"),
    imprint: () => import("@locales/en/imprint.json"),
    investor: () => import("@locales/en/investor.json"),
    careers: () => import("@locales/en/careers.json"),
    jobs: () => import("@locales/en/jobs.json"),
    apply: () => import("@locales/en/apply.json"),
    capital: () => import("@locales/en/capital.json"),
  },
  de: {
    common: () => import("@locales/de/common.json"),
    home: () => import("@locales/de/home.json"),
    shipper: () => import("@locales/de/shipper.json"),
    carrier: () => import("@locales/de/carrier.json"),
    faq: () => import("@locales/de/faq.json"),
    about: () => import("@locales/de/about.json"),
    footer: () => import("@locales/de/footer.json"),
    "get-started": () => import("@locales/de/get-started.json"),
    corridor: () => import("@locales/de/corridor.json"),
    privacy: () => import("@locales/de/privacy.json"),
    cookies: () => import("@locales/de/cookies.json"),
    terms: () => import("@locales/de/terms.json"),
    imprint: () => import("@locales/de/imprint.json"),
    investor: () => import("@locales/de/investor.json"),
    careers: () => import("@locales/de/careers.json"),
    jobs: () => import("@locales/de/jobs.json"),
    apply: () => import("@locales/de/apply.json"),
    capital: () => import("@locales/de/capital.json"),
  },
};

// ============================================================================
// Core Functions
// ============================================================================

async function loadNamespace(
  locale: LocaleCode,
  namespace: Namespace,
): Promise<TranslationObject> {
  try {
    console.log(`Loading namespace: ${locale}/${namespace}`);
    const importFn = localeImportMap[locale]?.[namespace];
    if (!importFn) {
      throw new Error(`No import function for ${locale}/${namespace}`);
    }
    const module = await importFn();
    console.log(
      `Loaded ${namespace}:`,
      module.default ? "has default" : "no default",
    );
    return (module.default || module) as TranslationObject;
  } catch (err) {
    console.warn(
      `Failed to load namespace ${namespace} for locale ${locale}:`,
      err,
    );

    if (locale !== defaultLanguage) {
      return loadNamespace(defaultLanguage, namespace);
    }
    return {} as TranslationObject;
  }
}

async function loadLocaleFile(
  locale: LocaleCode,
  useCache: boolean = true,
): Promise<NamespacedTranslations> {
  if (useCache && translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    const namespacePromises = translationNamespaces.map(async (namespace) => {
      const translations = await loadNamespace(locale, namespace);
      return { namespace, translations };
    });

    const results = await Promise.all(namespacePromises);

    const combinedTranslations: NamespacedTranslations = {};
    results.forEach(({ namespace, translations }) => {
      combinedTranslations[namespace] = translations;
    });

    translationCache.set(locale, combinedTranslations);
    return combinedTranslations;
  } catch (err) {
    console.error(`Error loading locale ${locale}:`, err);
    if (locale !== defaultLanguage) {
      return loadLocaleFile(defaultLanguage, useCache);
    }
    throw err;
  }
}

async function loadSingleNamespace(
  locale: LocaleCode,
  namespace: Namespace,
): Promise<TranslationObject> {
  if (translationCache.has(locale)) {
    const cached = translationCache.get(locale)!;
    if (cached[namespace]) {
      return cached[namespace];
    }
  }

  const translations = await loadNamespace(locale, namespace);

  if (!translationCache.has(locale)) {
    translationCache.set(locale, {});
  }
  translationCache.get(locale)![namespace] = translations;

  return translations;
}

function getNestedTranslation(
  key: string,
  json: NamespacedTranslations,
): string | null {
  let result: unknown = json;
  const keys = key.split(".");

  for (const k of keys) {
    // Handle array bracket notation: essentialItems[0] -> essentialItems, [0]
    const match = k.match(/^(.+?)\[(\d+)\]$/);

    if (match) {
      const propName = match[1];
      const index = parseInt(match[2], 10);

      if (result && typeof result === "object" && propName in result) {
        result = (result as Record<string, unknown>)[propName];
        if (Array.isArray(result) && index < result.length) {
          result = result[index];
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      if (result && typeof result === "object" && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return null;
      }
    }
  }

  return typeof result === "string" ? result : null;
}

function processVariables(text: string, element: HTMLElement): string {
  const variables = text.match(/{(.*?)}/g);
  if (!variables) return text;

  let processedText = text;

  variables.forEach((variable) => {
    const varName = variable.slice(1, -1);

    Object.entries(element.dataset).forEach(([key, value]) => {
      if (key === varName && value) {
        try {
          processedText = processedText.replace(
            variable,
            new Function(`return (${value})`)() as string,
          );
        } catch {
          processedText = processedText.replace(variable, value);
        }
      }
    });
  });

  return processedText;
}

async function translatePage(): Promise<void> {
  try {
    const json = await loadLocaleFile(pageLanguage);
    console.log("Loaded translations, namespaces:", Object.keys(json));
    const elements = document.querySelectorAll<HTMLElement>("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (!key) return;

      let text = getNestedTranslation(key, json);
      if (!text) {
        console.warn(
          `Translation key not found: ${key}`,
          "Available:",
          Object.keys(json),
        );
        return;
      }

      text = processVariables(text, element);
      element.innerHTML = text;
    });

    // Handle data-i18n-placeholder attributes (for input/textarea elements)
    const placeholderElements = document.querySelectorAll<HTMLElement>(
      "[data-i18n-placeholder]",
    );
    placeholderElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (!key) return;
      const text = getNestedTranslation(key, json);
      if (
        text &&
        (element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement)
      ) {
        element.placeholder = text;
      }
    });

    // Handle data-i18n-content attributes (for meta tags)
    const contentElements = document.querySelectorAll<HTMLElement>(
      "[data-i18n-content]",
    );
    contentElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-content");
      if (!key) return;
      const text = getNestedTranslation(key, json);
      if (text) {
        element.setAttribute("content", text);
      }
    });

    document.documentElement.setAttribute("lang", pageLanguage);
    updateLanguageSelectors();
  } catch (error) {
    console.error("Translation error:", error);
  }
}

async function changeLanguage(
  newLanguage: LocaleCode,
  updateUrl: boolean = true,
  savePreference: boolean = true,
): Promise<void> {
  if (!availableLocales.includes(newLanguage)) {
    console.error(`Language ${newLanguage} is not supported`);
    return;
  }

  pageLanguage = newLanguage;
  languageSource = "manual";

  if (updateUrl) {
    updateUrlLanguage(newLanguage);
  }

  if (savePreference) {
    saveLanguagePreference(newLanguage);
  }

  await translatePage();
}

async function redetectLanguage(): Promise<void> {
  const detected = detectLanguage();
  pageLanguage = detected.language;
  languageSource = detected.source;
  await translatePage();
}

function getLanguageInfo(): { language: LocaleCode; source: LanguageSource } {
  return { language: pageLanguage, source: languageSource };
}

function clearCache(locale?: LocaleCode): void {
  if (locale) {
    translationCache.delete(locale);
  } else {
    translationCache.clear();
  }
}

async function t(
  key: string,
  variables?: Record<string, string>,
): Promise<string> {
  const json = await loadLocaleFile(pageLanguage);
  let text = getNestedTranslation(key, json);

  if (!text) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text!.replace(new RegExp(`{${varKey}}`, "g"), value);
    });
  }

  return text;
}

// ============================================================================
// Language Selector
// ============================================================================

function createLanguageSelector(
  container: HTMLElement | string,
  options?: {
    showFlags?: boolean;
    className?: string;
  },
): HTMLSelectElement {
  const containerEl =
    typeof container === "string"
      ? document.querySelector<HTMLElement>(container)
      : container;

  if (!containerEl) {
    throw new Error("Container element not found");
  }

  const select = document.createElement("select");
  select.className = options?.className || "language-selector";

  availableLocales.forEach((locale) => {
    const option = document.createElement("option");
    option.value = locale;
    option.textContent = localeNames[locale];
    if (locale === pageLanguage) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    changeLanguage(target.value as LocaleCode);
  });

  containerEl.appendChild(select);
  return select;
}

function updateLanguageSelectors(): void {
  const selectors = document.querySelectorAll<HTMLSelectElement>(
    ".language-selector, [data-language-selector]",
  );

  selectors.forEach((selector) => {
    if (selector.value !== pageLanguage) {
      selector.value = pageLanguage;
    }
  });

  // Update toggle buttons
  document
    .querySelectorAll<HTMLElement>(".language-toggle-mobile")
    .forEach((btn) => {
      const span = btn.querySelector("span");
      if (span) span.textContent = pageLanguage.toUpperCase();
    });
}

/**
 * Attaches event listeners to all language selectors
 */
function attachLanguageSelectorListeners(): void {
  const selectors =
    document.querySelectorAll<HTMLSelectElement>(".language-selector");

  selectors.forEach((selector) => {
    const newSelector = selector.cloneNode(true) as HTMLSelectElement;
    selector.parentNode?.replaceChild(newSelector, selector);

    newSelector.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      changeLanguage(target.value as LocaleCode);
    });

    newSelector.value = pageLanguage;
  });

  // Attach toggle listeners for mobile pill buttons
  document
    .querySelectorAll<HTMLElement>(".language-toggle-mobile")
    .forEach((btn) => {
      const newBtn = btn.cloneNode(true) as HTMLElement;
      btn.parentNode?.replaceChild(newBtn, btn);

      // Set initial label
      const span = newBtn.querySelector("span");
      if (span) span.textContent = pageLanguage.toUpperCase();

      newBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const next: LocaleCode = pageLanguage === "en" ? "de" : "en";
        changeLanguage(next);
      });
    });
}

function initLanguageSelectors(): void {
  const containers = document.querySelectorAll<HTMLElement>(
    "[data-language-selector]",
  );

  containers.forEach((container) => {
    if (!container.querySelector("select")) {
      const className =
        container.dataset.languageSelector || "language-selector";
      createLanguageSelector(container, { className });
    }
  });

  attachLanguageSelectorListeners();
}

// ============================================================================
// Initialization
// ============================================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    translatePage();
    initLanguageSelectors();
  });
} else {
  translatePage();
  initLanguageSelectors();
}

// ============================================================================
// Exports
// ============================================================================

export {
  translatePage,
  loadLocaleFile,
  loadSingleNamespace,
  changeLanguage,
  redetectLanguage,
  getLanguageInfo,
  clearCache,
  detectLanguage,
  t,
  createLanguageSelector,
  updateLanguageSelectors,
  initLanguageSelectors,
  attachLanguageSelectorListeners,
  updateUrlLanguage,
  saveLanguagePreference,
  clearLanguagePreference,
  pageLanguage,
  languageSource,
  availableLocales,
  localeNames,
  translationNamespaces,
};

export type {
  LocaleCode,
  Namespace,
  TranslationObject,
  NamespacedTranslations,
  LanguageSource,
};
