const fs = require("fs");
const path = require("path");

const BRIEF_PATH = path.join(__dirname, ".github", "prompts", "create-website.prompt.md");

function validateBrief(brief) {
  const errors = [];
  const placeholders = [];

  function check(obj, prefix = "") {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") {
        if (value.includes("{{") && value.includes("}}")) {
          placeholders.push(fullKey);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === "string") {
            if (item.includes("{{") && item.includes("}}")) {
              placeholders.push(`${fullKey}[${i}]`);
            }
          } else if (typeof item === "object" && item !== null) {
            check(item, `${fullKey}[${i}]`);
          }
        });
      } else if (typeof value === "object" && value !== null) {
        check(value, fullKey);
      }
    }
  }

  check(brief);

  if (placeholders.length > 0) {
    errors.push(
      `Missing ${placeholders.length} field(s):\n` +
        placeholders.map((p) => `  - ${p}`).join("\n")
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    placeholderCount: placeholders.length,
  };
}

function loadBrief() {
  const raw = fs.readFileSync(BRIEF_PATH, "utf8");
  const match = raw.match(/```yaml\n([\s\S]*?)\n```/);
  if (!match) {
    throw new Error("Could not find YAML brief block in create-website.prompt.md");
  }

  const yamlLines = match[1].split("\n");
  const brief = {};
  let current = brief;
  const pathStack = [brief];

  for (const line of yamlLines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const indent = line.search(/\S/);
    const content = line.trim();

    if (content.startsWith("- ")) {
      const parent = pathStack[pathStack.length - 1];
      const key = Object.keys(parent).pop();
      if (!Array.isArray(parent[key])) {
        parent[key] = [];
      }
      parent[key].push(content.slice(2).replace(/^"|"$/g, ""));
    } else if (content.includes(":")) {
      const [key, ...rest] = content.split(":");
      const value = rest.join(":").trim().replace(/^"|"$/g, "");

      while (pathStack.length > 1 && indent <= pathStack[pathStack.length - 2]?._indent) {
        pathStack.pop();
      }

      const parent = pathStack[pathStack.length - 1];
      if (value === "" || value === "|") {
        parent[key.trim()] = "";
      } else {
        parent[key.trim()] = value || "";
      }
    }
  }

  return brief;
}

const brief = {
  website: {
    name: "{{Your Website Name}}",
    url: "{{https://yourdomain.com}}",
    repo: "{{https://github.com/your-org/your-repo}}",
  },
  business: {
    model: "{{SaaS / Ecommerce / Content / Lead-gen / Marketplace / Other}}",
    industry: "{{e.g. Fintech, Health, Education, DevTools}}",
    targetAudience: "{{e.g. freelance developers, small business owners, students}}",
    valueProposition: "{{One sentence: what problem do you solve and for whom?}}",
    differentiators: [
      "{{e.g. 10x faster than competitors}}",
      "{{e.g. Built specifically for your niche}}",
      "{{e.g. Free tier with no time limit}}",
    ],
  },
  goals: {
    primary: "{{e.g. Generate 1000 signups/month}}",
    secondary: ["{{e.g. Rank #1 for 5 keywords}}", "{{e.g. 90+ Lighthouse score}}"],
    timeline: "{{e.g. 3 months to MVP, 6 months to scale}}",
  },
  content: {
    pages: [
      { name: "Home", purpose: "Hero, value prop, primary CTA, social proof" },
      { name: "About", purpose: "Founder story, mission, team" },
      { name: "Product", purpose: "Features, pricing, use cases" },
      { name: "Blog", purpose: "Topical content, SEO, thought leadership" },
      { name: "Contact", purpose: "Form, location, support links" },
    ],
    existingContent: "{{No — generate from scratch}}",
    brandGuidelines:
      "{{Link to brand doc or describe: colors, typography, tone, voice}}",
  },
  technical: {
    preferredStack: "{{e.g. Next.js + Tailwind + Vercel, or leave blank}}",
    cms: "{{e.g. Contentful, Sanity, Ghost, or leave blank}}",
    hosting: "{{e.g. Vercel, AWS, Cloudflare Pages}}",
    database: "{{e.g. PostgreSQL, Supabase, Firebase}}",
    integrations: [
      "{{e.g. Stripe}}",
      "{{e.g. Posthog}}",
      "{{e.g. Resend}}",
      "{{e.g. Sentry}}",
    ],
    constraints: "{{e.g. WCAG AA, Lighthouse 90+, 10k concurrent users}}",
  },
  seo: {
    targetKeywords: ["{{primary keyword 1}}", "{{primary keyword 2}}"],
    competitors: ["{{competitor1.com}}", "{{competitor2.com}}"],
    regions: "{{e.g. US, UK, EU}}",
    languages: "{{e.g. en only, en + es}}",
  },
  compliance: {
    regulations: "{{e.g. GDPR, CCPA}}",
    dataCollected: "{{e.g. email, payment info, usage analytics}}",
    cookieConsent: "{{Yes / No / Required}}",
  },
  growth: {
    acquisitionChannels: ["{{Organic SEO}}", "{{Content Marketing}}", "{{Paid Ads}}"],
    monetization: "{{Subscription / One-time / Freemium / Ads / Marketplace}}",
    emailProvider: "{{e.g. Resend, Mailgun, SendGrid}}",
    analytics: "{{e.g. GA4, Mixpanel, Posthog}}",
  },
};

function printBrief(brief) {
  console.log("\n=== WEBSITE BRIEF ===\n");
  function printObj(obj, indent = 0) {
    const pad = "  ".repeat(indent);
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        console.log(`${pad}${key}:`);
        value.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            printObj(item, indent + 1);
          } else {
            console.log(`${pad}  - ${item}`);
          }
        });
      } else if (typeof value === "object" && value !== null) {
        console.log(`${pad}${key}:`);
        printObj(value, indent + 1);
      } else {
        console.log(`${pad}${key}: ${value}`);
      }
    }
  }
  printObj(brief);
  console.log("\n=== END BRIEF ===\n");
}

const validation = validateBrief(brief);

if (!validation.valid) {
  console.log("\n❌ BRIEF INCOMPLETE\n");
  console.log(validation.errors.join("\n"));
  console.log(
    `\nFill in all {{...}} placeholders in website-brief.js, then run again.\n`
  );
  process.exit(1);
}

console.log("\n✅ BRIEF COMPLETE — all fields filled\n");
printBrief(brief);

console.log("Next step:");
console.log(
  `  Paste the filled brief + this file into your AI agent with:`
);
console.log(`  "Execute .github/prompts/create-website.prompt.md using the website-brief.js data"`);
console.log(
  `\nOr run: node website-brief.js > brief-output.json && feed that into your agent.\n`
);

module.exports = { brief, validateBrief, loadBrief };
