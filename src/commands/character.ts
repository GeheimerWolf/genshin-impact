import { botCache } from "../../cache.ts";
import { Message } from "../../deps.ts";
import { needReaction } from "../utils/collectors.ts";
import { Embed } from "../utils/Embed.ts";
import { createCommand } from "../utils/helpers.ts";
import { characters } from "./setup.ts";

createCommand({
  name: "character",
  arguments: [
    { name: "character", type: "string" },
    { name: "page", type: "number", defaultValue: 1 },
  ],
  guildOnly: true,
  execute: async function (message, args) {
    const character = characters.get(args.character);
    if (!character)
      return message.reply(
        [
          "Invalid character name provided. Valid names are:",
          "",
          [...characters.values()].map((c) => c.name.toLowerCase()).join(" "),
        ].join("\n")
      );

    const first = new Embed()
      .setAuthor(character.name)
      .setTitle(character.title)
      .setDescription([
        // @ts-ignore
        character.rarity,
        `**Vision:** ${character.element}`,
        `**Weapon:** ${character.weapon}`,
        "",
        // @ts-ignore
        character.description,
        "",
        "🧿 - Main info",
        "💠 - More info",
        "⚔️ - Skill Talents",
        "🪄 - Passive Talents",
        "🔮 - Constellations",
      ])
      .setThumbnail(character.thumbnail);

    const second = new Embed()
      .setTitle(character.name)
      .setDescription([
        `**Nation:** ${character.vision}`,
        `**Affilation:** ${character.weapon}`,
        `**Special Dish:** ${character.specialDish}`,
        `**Constellation:** ${character.constellation}`,
        `**Birthday:** ${character.birthday}`,
        "",
        // @ts-ignore
        character.description,
        "",
        "🧿 - Main info",
        "💠 - More info",
        "⚔️ - Skill Talents",
        "🪄 - Passive Talents",
        "🔮 - Constellations",
      ])
      .setImage(character.image);

    const third = new Embed()
      .setTitle(character.name)
      .setDescription([
        "**Skill Talents**",
        "",
        "🧿 - Main info",
        "💠 - More info",
        "⚔️ - Skill Talents",
        "🪄 - Passive Talents",
        "🔮 - Constellations",
      ])
      .setThumbnail(character.thumbnail);
    for (const talent of character.activeTalents) {
      third.addField(talent.name, talent.description);
    }

    const fourth = new Embed()
      .setTitle(character.name)
      .setDescription([
        "**Passive Talents**",
        "",
        "🧿 - Main info",
        "💠 - More info",
        "⚔️ - Skill Talents",
        "🪄 - Passive Talents",
        "🔮 - Constellations",
      ])
      .setThumbnail(character.thumbnail);
    for (const talent of character.passiveTalents) {
      fourth.addField(talent.name, talent.description);
    }

    const fifth = new Embed()
      .setTitle(character.name)
      .setDescription([
        "**Constellations**",
        "",
        "🧿 - Main info",
        "💠 - More info",
        "⚔️ - Skill Talents",
        "🪄 - Passive Talents",
        "🔮 - Constellations",
      ])
      .setThumbnail(character.thumbnail);

    for (const constellation of character.constellations) {
      fifth.addField(constellation.name, constellation.description);
    }

    const pages = {
      1: { page: 1, embed: first, emoji: "🧿" },
      2: { page: 2, embed: second, emoji: "💠" },
      3: { page: 3, embed: third, emoji: "⚔️" },
      4: { page: 4, embed: fourth, emoji: "🪄" },
      5: { page: 5, embed: fifth, emoji: "🔮" },
    } as Record<number, { page: number; embed: Embed; emoji: string } | undefined>;

    const page = pages[args.page];
    if (!page) return;

    // SEND FIRST EMBED
    const response = args.msg
      ? await (args.msg as Message).edit({ embed: page.embed }).catch(console.log)
      : await message.reply({ embed: page.embed }).catch(console.log);
    if (!response) return;

    const emojis = ["🧿", "💠", "⚔️", "🪄", "🔮"];
    // ADD THE REACTIONS
    if (!args.msg) await response.addReactions(emojis, true).catch(console.log);

    // HANDLE PAGINATION
    const reaction = await needReaction(message.author.id, response.id).catch(console.log);
    if (!reaction) return;

    const selectedPage = Object.values(pages).find((page) => page?.emoji === reaction);
    if (!selectedPage) return;

    if (selectedPage.page !== args.page)
      return botCache.commands
        .get("character")
        ?.execute?.(message, { character: args.character, page: selectedPage.page, msg: response });

    await response.removeAllReactions().catch(console.log);
  },
});

characters.forEach((c) =>
  createCommand({
    name: c.name.toLowerCase(),
    guildOnly: true,
    execute: async function (message, args, guild) {
      return botCache.commands
        .get("character")
        ?.execute?.(message, { character: c.name.toLowerCase(), page: 1 }, guild);
    },
  })
);
