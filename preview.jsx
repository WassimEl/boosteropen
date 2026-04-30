import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CARD_BACK = "https://images.pokemontcg.io/cardback.png";

/* =========================
   🎴 CONFIG RARITY SYSTEM
========================= */
const rarities = [
  { name: "C", label: "Commune", weight: 55, glow: "shadow-gray-500/20" },
  { name: "U", label: "Peu Commune", weight: 25, glow: "shadow-green-500/40" },
  { name: "R", label: "Rare", weight: 12, glow: "shadow-blue-500/50" },
  { name: "UR", label: "Ultra Rare", weight: 6, glow: "shadow-purple-500/70" },
  { name: "SIR", label: "Secret Illustration Rare", weight: 2, glow: "shadow-yellow-400/90" },
];

/* =========================
   🎲 RANDOM RARITY PICK
========================= */
function getRandomRarity() {
  const rand = Math.random();
  let sum = 0;

  for (const r of rarities) {
    sum += r.weight;
    if (rand * 100 < sum) return r;
  }
  return rarities[0];
}

/* =========================
   🎴 DATA ADAPTER (READY API)
========================= */
// 👉 ICI plus tard tu branches vraie API Scrydex ou JSON officiel
async function fetchAscendedHeroesCard() {
  const id = Math.floor(Math.random() * 100) + 1;

  // ⚠️ MOCK STRUCTURE (remplaçable par API réelle)
  return {
    id,
    name: `Ascended Hero #${id}`,
    image: `https://images.pokemontcg.io/base1/${id}.png`,
    price: (Math.random() * 200).toFixed(2),
  };
}

/* =========================
   🎴 BUILD CARD
========================= */
async function createCard(rarity) {
  const base = await fetchAscendedHeroesCard();

  return {
    ...base,
    rarity,
  };
}

/* =========================
   MAIN COMPONENT
========================= */
export default function BoosterGoonerV5() {
  const [cards, setCards] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [opening, setOpening] = useState(false);
  const [collection, setCollection] = useState([]);
  const [bestCard, setBestCard] = useState(null);

  /* =========================
     🎴 OPEN BOOSTER
  ========================= */
  const openBooster = async () => {
    setOpening(true);
    setCards([]);
    setRevealedIndex(-1);

    const pack = [];

    for (let i = 0; i < 10; i++) {
      const rarity = getRandomRarity();
      const card = await createCard(rarity);
      pack.push(card);
    }

    // 💰 BEST CARD = VALUE BASED
    const best = [...pack].sort(
      (a, b) => parseFloat(b.price) - parseFloat(a.price)
    )[0];

    setCards(pack);
    setBestCard(best);
  };

  /* =========================
     🎬 REVEAL ANIMATION
  ========================= */
  useEffect(() => {
    if (!opening) return;

    if (revealedIndex < cards.length - 1) {
      const t = setTimeout(() => {
        setRevealedIndex((p) => p + 1);
      }, 500);

      return () => clearTimeout(t);
    }

    if (revealedIndex === cards.length - 1 && cards.length > 0) {
      setCollection((p) => {
        const updated = [...p, ...cards];
        localStorage.setItem("collection", JSON.stringify(updated));
        return updated;
      });

      setOpening(false);
    }
  }, [revealedIndex, opening, cards]);

  /* =========================
     💾 LOAD COLLECTION
  ========================= */
  useEffect(() => {
    const saved = localStorage.getItem("collection");
    if (saved) setCollection(JSON.parse(saved));
  }, []);

  return (
    <div className="min-h-screen bg-[#05050a] text-white flex">

      {/* SIDEBAR */}
      <div className="w-[260px] bg-[#0b0b12] p-4 border-r border-purple-500/20 hidden md:block">
        <h2 className="text-xl text-purple-400 mb-4">Profil</h2>
        <p>Gooner</p>
        <p className="text-sm text-gray-400">Niveau 23</p>

        <div className="mt-6 text-sm text-gray-300">
          <p>Boosters: {Math.floor(collection.length / 10)}</p>
          <p>Cartes: {collection.length}</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        <h1 className="text-4xl font-bold text-purple-400 mb-6">
          BoosterGooner V5 — Ascended Heroes
        </h1>

        {/* OPEN */}
        <button
          onClick={openBooster}
          className="px-6 py-3 bg-purple-600 rounded-xl mb-8"
        >
          Ouvrir un booster
        </button>

        {/* PACK */}
        <div className="flex gap-6 overflow-x-auto pb-6">
          {cards.map((card, i) => {
            const revealed = i <= revealedIndex;

            return (
              <motion.div
                key={i}
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{
                  rotateY: revealed ? 0 : 180,
                  opacity: revealed ? 1 : 0.3,
                }}
                transition={{ duration: 0.5 }}
                className={`min-w-[220px] h-[320px] rounded-2xl bg-[#111] flex items-center justify-center ${revealed ? card.rarity.glow : ""}`}
              >
                <img
                  src={revealed ? card.image : CARD_BACK}
                  className="h-full object-contain"
                />
              </motion.div>
            );
          })}
        </div>

        {/* BEST CARD */}
        <AnimatePresence>
          {bestCard && !opening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-6 rounded-3xl mt-10 ${bestCard.rarity.glow}`}
            >
              <img src={bestCard.image} className="w-[260px]" />
              <p className="text-yellow-400 mt-2">
                ⭐ Meilleure carte — ${bestCard.price}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COLLECTION */}
        <h2 className="text-2xl mt-10 mb-4 text-purple-300">
          Collection
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {collection.map((c, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              className={`bg-[#111] p-2 rounded-xl ${c.rarity.glow}`}
            >
              <img src={c.image} />
              <p className="text-xs text-center text-gray-400">
                ${c.price}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}