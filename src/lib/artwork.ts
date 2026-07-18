// アーキタイプID → カードSVG(public/archetypes/)の対応
// カードの様式は STYLE_GUIDE.md「アーキタイプアートワーク規約」を参照
export const ARCHETYPE_CARD_IMAGES: Record<string, string> = {
  thinker: '/archetypes/archetype-thinker.svg',
  creator: '/archetypes/archetype-creator.svg',
  scientist: '/archetypes/archetype-scientist.svg',
  explorer: '/archetypes/archetype-explorer.svg',
  sage: '/archetypes/archetype-sage.svg',
}

export function getArchetypeCardImage(archetypeId: string): string {
  return ARCHETYPE_CARD_IMAGES[archetypeId] ?? ARCHETYPE_CARD_IMAGES.thinker!
}
