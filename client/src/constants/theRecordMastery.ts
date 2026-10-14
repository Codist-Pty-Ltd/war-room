import type { MasteryTrack } from "./ntokozoMastery";
import warroom from "./therecord.warroom.json";

type WarroomFlashcard = {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  followUps?: string[];
  codeExample?: string;
};

type WarroomPayload = typeof warroom;

const mapDifficulty = (d: string): "SENIOR" | "LEAD" | "PRINCIPAL" => {
  if (d === "staff") return "LEAD";
  if (d === "principal") return "PRINCIPAL";
  return "SENIOR";
};

const appendCodeExample = (answer: string, codeExample?: string) => {
  if (!codeExample?.trim()) return answer;
  return `${answer}\n\n**Code:** \`${codeExample}\``;
};

const flashcardDrills = (warroom.flashcards as WarroomFlashcard[]).map((card) => ({
  id: `rec_${card.id}`,
  difficulty: mapDifficulty(card.difficulty),
  question: card.question,
  answer: appendCodeExample(card.answer, card.codeExample),
  followUp: card.followUps?.[0],
  tags: ["the-record", card.category],
}));

const systemDesignDrills = warroom.systemDesignTopics.map((topic, i) => ({
  id: `rec_sd_${i + 1}`,
  difficulty: "LEAD" as const,
  question: topic.interviewQuestion,
  answer: `**Current:** ${topic.currentImplementation}\n\n**Senior insight:** ${topic.seniorInsight}`,
  tags: ["the-record", "system-design", topic.topic.toLowerCase().replace(/\s+/g, "-")],
}));

const behaviouralDrills = warroom.behaviouralAnchors.map((anchor, i) => ({
  id: `rec_beh_${i + 1}`,
  difficulty: "SENIOR" as const,
  question: anchor.question,
  answer: `**Situation:** ${anchor.situation}\n\n**Task:** ${anchor.task}\n\n**Action:** ${anchor.action}\n\n**Result:** ${anchor.result}\n\n**Senior signal:** ${anchor.seniorSignal}`,
  tags: ["the-record", "behavioural", "star"],
}));

const dangerZoneDefinitions = warroom.dangerZones.map((zone) => ({
  term: zone.area,
  definition: zone.whatSeniorSays,
  example: `Junior trap: "${zone.whatJuniorSays}" — Risk: ${zone.risk}`,
}));

const product = warroom.product as WarroomPayload["product"];
const servers = product.servers as string[];

export const THE_RECORD_TRACK: MasteryTrack = {
  id: "THE_RECORD",
  title: "The Record (Accountability)",
  description: `${product.oneLiner} Stack: ${product.stack.slice(0, 5).join(", ")}… — ${flashcardDrills.length} flashcards from therecord.co.za audit.`,
  color: "#DC2626",
  definitions: [
    {
      term: "The Record",
      definition: product.oneLiner,
      example: `Live at therecord.co.za — ${servers.slice(1, 5).join(", ")} on Hetzner`,
    },
    ...dangerZoneDefinitions,
  ],
  drills: [...flashcardDrills, ...systemDesignDrills, ...behaviouralDrills],
  codeDrills: [
    {
      id: "rec_code_001",
      title: "IngestionApiKeyGuard — NestJS Write Auth",
      brief:
        "The Record has no user JWT. Implement IngestionApiKeyGuard: compare x-ingestion-key header to INGESTION_API_KEY env; throw UnauthorizedException on mismatch.",
      language: "csharp",
      starter: `@Injectable()
export class IngestionApiKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    // TODO: read x-ingestion-key header
    // TODO: compare to config.get('INGESTION_API_KEY')
    // TODO: throw UnauthorizedException if missing or wrong
    return true;
  }
}`,
      hints: [
        "Use context.switchToHttp().getRequest<Request>()",
        "Header name is lowercase in Express: req.headers['x-ingestion-key']",
        "Use timing-safe compare if you want to be pedantic — at minimum strict equality",
        "Apply with @UseGuards(IngestionApiKeyGuard) on ingestion controllers only",
      ],
      solution: `@Injectable()
export class IngestionApiKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-ingestion-key'];
    const expected = this.config.get<string>('INGESTION_API_KEY');

    if (!expected || typeof key !== 'string' || key !== expected) {
      throw new UnauthorizedException('Invalid ingestion key');
    }
    return true;
  }
}`,
      takeaway:
        "Public read + shared-secret writes is a deliberate threat model — interviewers who assume JWT login miss the whole architecture.",
    },
    {
      id: "rec_code_002",
      title: "Search — pg_trgm Migration Path",
      brief:
        "SearchService uses ILIKE scans across 10 entity types. Write the PostgreSQL migration to add a trigram GIN index on stories.title and explain when ILIKE becomes unacceptable.",
      language: "sql",
      starter: `-- Current: ILIKE '%term%' on stories.title (seq scan)
-- TODO: enable extension
-- TODO: CREATE INDEX for title search
-- TODO: optional: composite with status filter`,
      hints: [
        "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
        "GIN index: CREATE INDEX ... ON stories USING gin (title gin_trgm_ops);",
        "ILIKE with leading wildcard cannot use B-tree — trigram is the Postgres-native fix before Meilisearch",
        "Keep per-type cap (5) in API even after indexing",
      ],
      solution: `CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_title_trgm
  ON stories USING gin (title gin_trgm_ops);

-- Query still uses ILIKE but planner can use bitmap index scan:
-- SELECT id, title FROM stories
-- WHERE title ILIKE '%mkhwanazi%'
-- ORDER BY updated_at DESC
-- LIMIT 5;

-- At ~1M rows without index: O(n) per entity type × 10 types per search request.
-- Meilisearch next step when ranking, facets, and typo tolerance matter.`,
      takeaway:
        "The Record shipped ILIKE with a cap knowing the cost — senior answer names the scan, the index migration, and when to leave Postgres entirely.",
    },
  ],
};
