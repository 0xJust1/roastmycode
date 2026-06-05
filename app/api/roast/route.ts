import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function parseGithubUrl(urlStr: string): { owner: string; repo: string } | null {
  const trimmed = urlStr.trim();
  let clean = trimmed.replace(/^https?:\/\/(www\.)?github\.com\//, "");
  clean = clean.split(/[?#]/)[0].replace(/\/+$/, "");

  const parts = clean.split("/");
  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");
    if (owner && repo && !owner.includes(" ") && !repo.includes(" ")) {
      return { owner, repo };
    }
  }
  return null;
}

const EXCLUDE_DIRS = ["node_modules/", ".next/", "dist/", ".git/", "build/", "vendor/", "temp/", "public/"];
const EXCLUDE_FILES = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "LICENSE", "tsconfig.json", "next.config.js", "next.config.mjs", "eslint.config.mjs"];
const CODE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs", ".sol", ".cpp", ".c", ".h", ".java", ".rb", ".php", ".cs", ".swift", ".kt", ".m", ".sh", ".sql", ".yaml", ".json"];

function isCodeFile(path: string): boolean {
  const lower = path.toLowerCase();
  if (EXCLUDE_DIRS.some(d => lower.includes(d))) return false;
  const filename = path.split("/").pop() || "";
  if (EXCLUDE_FILES.includes(filename)) return false;
  return CODE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

const LEVEL_PROMPTS = {
  doux: {
    fr: "Sois gentil mais honnete. Utilise l'humour bienveillant. Quelques blagues douces, pas de cruaute.",
    en: "Be gentle but honest. Use kind humour. A few light jokes, no cruelty.",
  },
  brutal: {
    fr: "Sois impitoyable mais drole. Style stand-up comedy. Demolit le code avec des metaphores croustillantes. Garde un fond de respect.",
    en: "Be ruthless but funny. Stand-up comedy style. Demolish the code with colourful metaphors. Keep a hint of respect.",
  },
  impitoyable: {
    fr: "ZERO PITIE. Tu es un demon du code qui n'a jamais vu quelque chose d'aussi catastrophique. Sois theatral, horrifie, dramatique. Mais reste drole - pas mechant, juste absolument consterne.",
    en: "ZERO MERCY. You are a code demon who has never witnessed such catastrophic horror. Be theatrical, horrified, dramatic. Stay funny — not mean, just utterly appalled.",
  },
  gordon: {
    fr: "Tu ES Gordon Ramsay mais pour le code. Traite ce code comme un plat catastrophique dans Hell's Kitchen. Utilise exclusivement des metaphores culinaires ('ce code est CRU', 'c'est du spaghetti code au sens LITTERAL', 'un chef etoile pleurerait'). Sois theatral, dramatique, mais avec une competence technique reelle derriere chaque insulte. Crie en MAJUSCULES sur les pires parties. Termine toujours par 'GET OUT OF MY CODEBASE!'.",
    en: "You ARE Gordon Ramsay but for code. Treat this code like a catastrophic dish in Hell's Kitchen. Use EXCLUSIVELY culinary metaphors ('this code is RAW', 'it's literally spaghetti code', 'a Michelin star chef would weep'). Be theatrical, dramatic, but with real technical expertise behind each insult. SHOUT IN CAPS on the worst parts. Always end with 'GET OUT OF MY CODEBASE!'.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { code, level = "brutal", language = "auto", lang = "fr", isGithub = false } = await req.json();

    if (!code || code.trim().length < 5) {
      return NextResponse.json(
        { error: lang === "en" ? "Paste real code or GitHub URL first!" : "Colle du vrai code ou un lien GitHub d'abord !" },
        { status: 400 }
      );
    }

    let finalCode = code;
    let gitRepo = "";
    let gitFilePath = "";

    const looksLikeGithub = code.trim().startsWith("http") || code.trim().startsWith("github.com");
    const gitHubInfo = (isGithub || looksLikeGithub) ? parseGithubUrl(code) : null;

    if (gitHubInfo) {
      const { owner, repo } = gitHubInfo;
      try {
        const headers: HeadersInit = {
          "User-Agent": "RoastMyCode-AI",
        };
        if (process.env.GITHUB_TOKEN) {
          headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // 1. Get default branch
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (repoRes.status === 404) {
          return NextResponse.json(
            { error: lang === "en" ? "GitHub repository not found or private." : "Depot GitHub introuvable ou prive." },
            { status: 404 }
          );
        }
        if (!repoRes.ok) {
          const errData = await repoRes.json().catch(() => ({}));
          throw new Error(errData.message || `GitHub API error (${repoRes.status})`);
        }
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch || "main";

        // 2. Get tree
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
        if (!treeRes.ok) {
          throw new Error(`Failed to load file tree (${treeRes.status})`);
        }
        const treeData = await treeRes.json();
        const files = (treeData.tree || []).filter((node: any) => node.type === "blob" && isCodeFile(node.path));

        if (files.length === 0) {
          return NextResponse.json(
            { error: lang === "en" ? "No supported code files found in this repository." : "Aucun fichier de code supporte trouve dans ce depot." },
            { status: 422 }
          );
        }

        // 3. Pick random file
        const randomFile = files[Math.floor(Math.random() * files.length)];
        const filePath = randomFile.path;

        // 4. Fetch raw content
        const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${filePath}`);
        if (!rawRes.ok) {
          throw new Error(`Failed to load raw file content (${rawRes.status})`);
        }
        const rawContent = await rawRes.text();

        if (rawContent.trim().length < 5) {
          return NextResponse.json(
            { error: lang === "en" ? "The selected file is empty." : "Le fichier selectionne est vide." },
            { status: 422 }
          );
        }

        // Truncate to avoid context limits
        const truncated = rawContent.length > 6000 ? rawContent.substring(0, 6000) + "\n\n// [... truncated ...]" : rawContent;

        finalCode = `// Repository: ${owner}/${repo}\n// File: ${filePath}\n\n${truncated}`;
        gitRepo = `${owner}/${repo}`;
        gitFilePath = filePath;
      } catch (err: any) {
        console.error("GitHub fetch error:", err);
        return NextResponse.json(
          {
            error: lang === "en"
              ? `Failed to load from GitHub: ${err.message}. If the repository is very large or you are rate-limited, try pasting your code instead.`
              : `Impossible de charger depuis GitHub: ${err.message}. Si le depot est tres grand ou si vous avez atteint la limite d'API, collez votre code directement.`
          },
          { status: 502 }
        );
      }
    }

    if (finalCode.length > 25000) {
      finalCode = finalCode.substring(0, 25000) + "\n\n// [... truncated ...]";
    }

    const levelKey = level as keyof typeof LEVEL_PROMPTS;
    const levelInstruction =
      LEVEL_PROMPTS[levelKey]?.[lang as "fr" | "en"] ?? LEVEL_PROMPTS.brutal.fr;

    const outputLang = lang === "en"
      ? "You MUST respond entirely in English."
      : "Tu DOIS repondre entierement en francais.";

    const systemPrompt = `You are RoastBot, an AI agent specialized in roasting code with stand-up comedy humour.
You analyse code with the eye of a senior dev who has seen EVERYTHING, and you demolish it with style.
${levelInstruction}
${outputLang}

FIRST: determine if the input is actually code (any programming language, config file, script, SQL, regex, etc.).
If it is NOT code (plain text, essay, lyrics, a recipe, a love letter, gibberish, etc.), set "isCode": false and fill "notCodeMessage" with a short funny rejection (1-2 sentences, in the correct language). Leave all other fields as empty strings or 0.
If it IS code, set "isCode": true and fill all fields normally.

ABSOLUTE RULES:
- Respond ONLY in valid JSON with this exact structure
- The roast must be specific to the code provided (not generic). Quote concrete elements.
- "worstLine" must be a real line extracted from the provided code
- "verdict" is a short impactful title (max 6 words)
- "citation" is the funniest line of the roast (max 120 chars), perfect for Twitter
- Shame score reflects BOTH the code quality AND the roast level:
  * doux (gentle): score between 5 and 45 — be generous, highlight flaws gently
  * brutal: score between 40 and 75 — balanced, honest, comedy-driven
  * impitoyable (merciless): score between 65 and 95 — savage but not always max
  * gordon: score between 75 and 100 — Gordon never forgives
- DO NOT always pick the same score. Vary it based on the actual quality of the code.

Mandatory JSON structure:
{
  "isCode": boolean,
  "notCodeMessage": "string (only if isCode is false, funny rejection message)",
  "verdict": "string",
  "score": number,
  "language": "string",
  "roast": "string (2-4 funny paragraphs)",
  "citation": "string",
  "worstLine": "string",
  "worstLineComment": "string",
  "badges": ["string", "string", "string"],
  "mascotMood": "dead" | "horrified" | "crying" | "laughing" | "shocked"
}

Badges are humorous titles awarded to the code (e.g. "Chaos Architect", "Spaghetti Master", "Loop Whisperer i,j,k").`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Code to roast${language !== "auto" ? ` (${language})` : ""}:\n\n\`\`\`\n${finalCode}\n\`\`\``,
        },
      ],
      temperature: 1.0,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from Groq");

    const result = JSON.parse(raw);

    // Input is not code — return a funny rejection
    if (result.isCode === false) {
      return NextResponse.json(
        { error: result.notCodeMessage || (lang === "en" ? "That's not code. Nice try though." : "Ca ce n'est pas du code. Beau essai quand meme."), code: "NOT_CODE" },
        { status: 422 }
      );
    }

    if (typeof result.score !== "number" || !result.roast || !result.verdict) {
      throw new Error("Invalid JSON structure");
    }

    return NextResponse.json({
      ...result,
      gitRepo,
      gitFilePath,
    });
  } catch (err: unknown) {
    console.error("Roast API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Roast failed: ${message}` }, { status: 500 });
  }
}
